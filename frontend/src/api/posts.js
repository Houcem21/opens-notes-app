import { supabase } from "./supabase";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePost(post) {
  return {
    ...post,
    _id: post.id,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
  };
}

export const postsApi = {
  async getPublishedPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map(normalizePost);
  },

  async getAdminPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map(normalizePost);
  },

  async createPost(postData) {
    const payload = {
      title: postData.title,
      slug: slugify(postData.title),
      summary: postData.summary || "",
      content: postData.content || "",
      category: postData.category || "general",
      status: postData.status || "draft",
    };

    const { data, error } = await supabase
      .from("posts")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return normalizePost(data);
  },

  async updatePost(postId, postData) {
    const payload = {
      title: postData.title,
      slug: slugify(postData.title),
      summary: postData.summary || "",
      content: postData.content || "",
      category: postData.category || "general",
      status: postData.status || "draft",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("posts")
      .update(payload)
      .eq("id", postId)
      .select()
      .single();

    if (error) throw error;
    return normalizePost(data);
  },

  async deletePost(postId) {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) throw error;
    return { ok: true };
  },
};