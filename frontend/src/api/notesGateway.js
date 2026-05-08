import { callFunction } from "./edgeClient";
import { orgSessionApi } from "./sessionGateway";

export const notesGateway = {
  async getOrgNotes() {
    const orgToken = orgSessionApi.getOrgToken();

    if (!orgToken) {
      throw new Error("Organization access required.");
    }

    return callFunction("get-org-notes", { orgToken });
  },

  async saveAdminNode(node) {
    const adminToken = orgSessionApi.getAdminToken();

    if (!adminToken) {
      throw new Error("Admin access required.");
    }

    return callFunction("save-admin-node", {
      adminToken,
      node,
    });
  },

  async deleteAdminNode(nodeId) {
    const adminToken = orgSessionApi.getAdminToken();

    if (!adminToken) {
      throw new Error("Admin access required.");
    }

    return callFunction("delete-admin-node", {
      adminToken,
      nodeId,
    });
  },
};