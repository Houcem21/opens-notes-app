import { handleOptions, jsonResponse } from "../_shared/responses.ts";
import { createServiceClient } from "../_shared/client.ts";
import { getValidSession } from "../_shared/sessions.ts";

const IGNORED_PARTS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  "coverage",
  ".vercel",
  ".supabase",
]);

type RepoNode = {
  title: string;
  parentPath: string | null;
  depth: number;
  path: string;
};

function parseGithubUrl(repoUrl: string) {
  const match = repoUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);

  if (!match) {
    throw new Error("Please enter a valid GitHub repository URL.");
  }

  return {
    owner: match[1],
    repo: match[2],
  };
}

function shouldIncludePath(path: string) {
  return !path.split("/").some((part) => IGNORED_PARTS.has(part));
}

async function fetchGithubTree(owner: string, repo: string, branch: string) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "internal-crm-importer",
      },
    },
  );

  if (!response.ok) return null;

  return response.json();
}

function createNodeMap(paths: string[]) {
  const nodes = new Map<string, RepoNode>();

  for (const path of paths) {
    const parts = path.split("/");

    parts.forEach((part, index) => {
      const currentPath = parts.slice(0, index + 1).join("/");
      const parentPath = index === 0 ? null : parts.slice(0, index).join("/");

      if (!nodes.has(currentPath)) {
        nodes.set(currentPath, {
          title: part,
          parentPath,
          depth: index + 1,
          path: currentPath,
        });
      }
    });
  }

  return nodes;
}

function groupChildren(nodes: Map<string, RepoNode>) {
  const childrenByParent = new Map<string, RepoNode[]>();

  for (const node of nodes.values()) {
    const parentKey = node.parentPath || "__root__";
    const children = childrenByParent.get(parentKey) || [];
    children.push(node);
    childrenByParent.set(parentKey, children);
  }

  for (const children of childrenByParent.values()) {
    children.sort((a, b) => a.title.localeCompare(b.title));
  }

  return childrenByParent;
}

function assignTreePositions(nodes: Map<string, RepoNode>) {
  const childrenByParent = groupChildren(nodes);
  const positions = new Map<string, { x: number; y: number }>();

  const horizontalGap = 380;
  const verticalGap = 170;

  let nextLeafY = 0;

  function layoutSubtree(parentKey: string, depth: number): number {
    const children = childrenByParent.get(parentKey) || [];

    if (children.length === 0) {
      const y = nextLeafY;
      nextLeafY += verticalGap;
      return y;
    }

    const childYs = children.map((child) => {
      const childY = layoutSubtree(child.path, depth + 1);

      positions.set(child.path, {
        x: child.depth * horizontalGap,
        y: childY,
      });

      return childY;
    });

    return (childYs[0] + childYs[childYs.length - 1]) / 2;
  }

  layoutSubtree("__root__", 1);

  return positions;
}

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { adminToken, repoUrl } = await req.json();

    if (!adminToken || typeof adminToken !== "string") {
      return jsonResponse({ error: "Admin token is required" }, 400);
    }

    if (!repoUrl || typeof repoUrl !== "string") {
      return jsonResponse({ error: "GitHub repository URL is required" }, 400);
    }

    const { owner, repo } = parseGithubUrl(repoUrl.trim());

    const supabase = createServiceClient();
    const session = await getValidSession(supabase, adminToken, "admin");

    const githubTree =
      (await fetchGithubTree(owner, repo, "main")) ||
      (await fetchGithubTree(owner, repo, "master"));

    if (!githubTree?.tree) {
      return jsonResponse(
        { error: "Could not read repository tree. Make sure the repo is public." },
        400,
      );
    }

    const paths = githubTree.tree
      .filter((item: { path: string; type: string }) => item.type === "tree")
      .map((item: { path: string }) => item.path)
      .filter(shouldIncludePath)
      .slice(0, 120);

    const graphName = `${repo} structure`;
    const nodeMap = createNodeMap(paths);
    const positions = assignTreePositions(nodeMap);

    const { data: tree, error: treeError } = await supabase
      .from("trees")
      .insert({
        organization_id: session.organization_id,
        name: graphName,
        graph_type: "tree",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (treeError) throw treeError;

    const { data: rootNode, error: rootError } = await supabase
      .from("nodes")
      .insert({
        tree_id: tree.id,
        parent_id: null,
        title: repo,
        notes: `Imported from https://github.com/${owner}/${repo}`,
        node_type: "block",
        pos_x: 0,
        pos_y: 0,
      })
      .select()
      .single();

    if (rootError) throw rootError;

    const insertedIds = new Map<string, string>();
    const edgeRows: Array<{
      tree_id: string;
      from_node_id: string;
      to_node_id: string;
      edge_type: string;
    }> = [];

    const sortedNodes = Array.from(nodeMap.values()).sort((a, b) => {
      if (a.depth !== b.depth) return a.depth - b.depth;
      return a.path.localeCompare(b.path);
    });

    for (const node of sortedNodes) {
      const parentId = node.parentPath
        ? insertedIds.get(node.parentPath)
        : rootNode.id;

      if (!parentId) continue;

      const position = positions.get(node.path) || {
        x: node.depth * 380,
        y: 0,
      };

      const { data: insertedNode, error: nodeError } = await supabase
        .from("nodes")
        .insert({
          tree_id: tree.id,
          parent_id: parentId,
          title: node.title,
          notes: node.path,
          node_type: "block",
          pos_x: position.x,
          pos_y: position.y,
        })
        .select()
        .single();

      if (nodeError) throw nodeError;

      insertedIds.set(node.path, insertedNode.id);

      edgeRows.push({
        tree_id: tree.id,
        from_node_id: parentId,
        to_node_id: insertedNode.id,
        edge_type: "tree",
      });
    }

    if (edgeRows.length > 0) {
      const { error: edgeError } = await supabase.from("edges").insert(edgeRows);
      if (edgeError) throw edgeError;
    }

    return jsonResponse({
      tree,
      importedCount: insertedIds.size + 1,
      edgeCount: edgeRows.length,
    });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});