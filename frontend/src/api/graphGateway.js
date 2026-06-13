import { callFunction } from "./edgeClient";
import { requireAdminToken, requireOrgToken } from "./authTokens";

export const graphGateway = {
  getOrgTrees() {
    return callFunction("get-org-trees", {
      orgToken: requireOrgToken(),
    });
  },

  getOrgGraph(treeId = null) {
    return callFunction("get-org-graph", {
      orgToken: requireOrgToken(),
      treeId,
    });
  },

  saveAdminNode(node) {
    return callFunction("save-admin-node", {
      adminToken: requireAdminToken(),
      node,
    });
  },

  deleteAdminNode(nodeId) {
    return callFunction("delete-admin-node", {
      adminToken: requireAdminToken(),
      nodeId,
    });
  },

  saveAdminTree(tree) {
    return callFunction("save-admin-tree", {
      adminToken: requireAdminToken(),
      tree,
    });
  },

  deleteAdminTree(treeId) {
    return callFunction("delete-admin-tree", {
      adminToken: requireAdminToken(),
      treeId,
    });
  },
  
  importGithubRepo(repoUrl) {
    return callFunction("import-github-repo", {
      adminToken: requireAdminToken(),
      repoUrl,
    });
  },
};