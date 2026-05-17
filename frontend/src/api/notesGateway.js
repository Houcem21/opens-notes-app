import { callFunction } from "./edgeClient";
import { requireAdminToken, requireOrgToken } from "./authTokens";

export const notesGateway = {
  getOrgNotes() {
    return callFunction("get-org-notes", {
      orgToken: requireOrgToken(),
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