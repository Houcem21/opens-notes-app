import { apiFetch } from "./client";

export const postsApi = {
  getPublishedPosts() {
    return apiFetch("/posts");
  },

  getAdminPosts() {
    return apiFetch("/posts/admin");
  },

  createPost(postData) {
    return apiFetch("/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  },

  updatePost(postId, postData) {
    return apiFetch(`/posts/${postId}`, {
      method: "PATCH",
      body: JSON.stringify(postData),
    });
  },

  deletePost(postId) {
    return apiFetch(`/posts/${postId}`, {
      method: "DELETE",
    });
  },
};