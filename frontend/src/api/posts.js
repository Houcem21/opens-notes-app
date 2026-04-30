import { supabase } from "./supabase";
import { timestampsFrom } from "../common/utils/dateMapping";
import { normalizePost, createPostPayload } from "./mappers/postMapper";
import { requireData, requireOk } from "../common/utils/supabaseResult";

import { createUniqueSlug } from "../common/utils/slug";


export const postsApi = {
  async getPublishedPosts() {
    const data = requireData(
      await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: true })
    );

    return data.map(normalizePost);
  },

  async getAdminPosts() {
    const data = requireData(
      await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: true })
    );

    return data.map(normalizePost);
  },

  async createPost(postData) {
    const data = requireData(
      await supabase
        .from("posts")
        .insert(createPostPayload(postData))
        .select()
        .single()
    );

    return normalizePost(data);
  },

  async updatePost(postId, postData) {
    const data = requireData(
      await supabase
        .from("posts")
        .update(createPostPayload(postData))
        .eq("id", postId)
        .select()
        .single()
    );

    return normalizePost(data);
  },

  async deletePost(postId) {
    return requireOk(
      await supabase.from("posts").delete().eq("id", postId)
    );
  },
};