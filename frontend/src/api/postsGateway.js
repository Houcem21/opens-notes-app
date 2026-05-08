import { callFunction } from "./edgeClient";
import { orgSessionApi } from "./sessionGateway";

export const postsGateway = {
  async getOrgPosts() {
    const orgToken = orgSessionApi.getOrgToken();

    if (!orgToken) {
      throw new Error("Organization access required.");
    }

    const data = await callFunction("get-org-posts", { orgToken });
    return data.posts || [];
  },

  async getAdminPosts() {
    const adminToken = orgSessionApi.getAdminToken();

    if (!adminToken) {
      throw new Error("Admin access required.");
    }

    const data = await callFunction("get-admin-posts", { adminToken });
    return data.posts || [];
  },

  async saveAdminPost(post) {
    const adminToken = orgSessionApi.getAdminToken();

    if (!adminToken) {
      throw new Error("Admin access required.");
    }

    const data = await callFunction("save-admin-post", {
      adminToken,
      post,
    });

    return data.post;
  },

  async deleteAdminPost(postId) {
    const adminToken = orgSessionApi.getAdminToken();

    if (!adminToken) {
      throw new Error("Admin access required.");
    }

    return callFunction("delete-admin-post", {
      adminToken,
      postId,
    });
  },
};