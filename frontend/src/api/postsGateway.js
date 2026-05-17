import { callFunction } from "./edgeClient";
import { requireAdminToken, requireOrgToken } from "./authTokens";

export const postsGateway = {
  async getOrgPosts() {
    const data = await callFunction("get-org-posts", {
      orgToken: requireOrgToken(),
    });

    return data.posts || [];
  },

  async getAdminPosts() {
    const data = await callFunction("get-admin-posts", {
      adminToken: requireAdminToken(),
    });

    return data.posts || [];
  },

  async saveAdminPost(post) {
    const data = await callFunction("save-admin-post", {
      adminToken: requireAdminToken(),
      post,
    });

    return data.post;
  },

  async deleteAdminPost(postId) {
    return callFunction("delete-admin-post", {
      adminToken: requireAdminToken(),
      postId,
    });
  },
};