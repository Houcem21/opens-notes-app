import { supabase } from "./supabase";
import { timestampsFrom } from "../common/utils/dateMapping";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePages(post) {
  if (Array.isArray(post.pages) && post.pages.length > 0) {
    return post.pages;
  }

  if (post.content) {
    return [{ title: "Page 1", content: post.content }];
  }

  return [{ title: "Page 1", content: "" }];
}

function normalizePost(post) {
  return {
    ...post,
    _id: post.id,
    ...timestampsFrom(post),
    pages: normalizePages(post),
  };
}

function toPayload(postData) {
  const pages =
    Array.isArray(postData.pages) && postData.pages.length > 0
      ? postData.pages
      : [{ title: "Page 1", content: postData.content || "" }];

  return {
    title: postData.title,
    slug: slugify(postData.title),
    summary: postData.summary || "",
    category: postData.category || "general",
    status: postData.status || "draft",
    pages,
    content: pages[0]?.content || "",
    updated_at: new Date().toISOString(),
  };
}

export const postsApi = {
  async getPublishedPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data.map(normalizePost);
  },

  async getAdminPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data.map(normalizePost);
  },

  async createPost(postData) {
    const payload = toPayload(postData);

    const { data, error } = await supabase
      .from("posts")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return normalizePost(data);
  },

  async updatePost(postId, postData) {
    const payload = toPayload(postData);

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