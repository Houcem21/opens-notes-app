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

  if (!response.ok) {
    return null;
  }

  return response.json();
}

function createNodeMap(paths: string[]) {
  const nodes = new Map<string, { title: string; parentPath: string | null; depth: number }>();

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
        });
      }
    });
  }

  return nodes;
}

function getPosition(index: number, depth: number) {
  return {
    x: depth * 260,
    y: index * 95,
  };
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

    const { data: tree, error: treeError } = await supabase
      .from("trees")
      .insert({
        organization_id: session.organization_id,
        name: graphName,
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
        pos_x: 0,
        pos_y: 0,
      })
      .select()
      .single();

    if (rootError) throw rootError;

    const nodeMap = createNodeMap(paths);
    const insertedIds = new Map<string, string>();

    let index = 1;

    for (const [path, node] of nodeMap.entries()) {
      const parentId = node.parentPath
        ? insertedIds.get(node.parentPath)
        : rootNode.id;

      if (!parentId) continue;

      const position = getPosition(index, node.depth);

      const { data: insertedNode, error: nodeError } = await supabase
        .from("nodes")
        .insert({
          tree_id: tree.id,
          parent_id: parentId,
          title: node.title,
          notes: path,
          pos_x: position.x,
          pos_y: position.y,
        })
        .select()
        .single();

      if (nodeError) throw nodeError;

      insertedIds.set(path, insertedNode.id);
      index += 1;
    }

    return jsonResponse({
      tree,
      importedCount: insertedIds.size + 1,
    });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});