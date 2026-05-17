import { callFunction } from "./edgeClient";
import { requireAdminToken, requireOrgToken } from "./authTokens";

export const notesGateway = {
  getOrgTrees() {
    return callFunction("get-org-trees", {
      orgToken: requireOrgToken(),
    });
  },

  getOrgNotes(treeId = null) {
    return callFunction("get-org-notes", {
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
};