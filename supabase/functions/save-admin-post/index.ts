import { handleOptions, jsonResponse } from "../_shared/responses.ts";
import { createServiceClient } from "../_shared/client.ts";
import { getValidSession } from "../_shared/sessions.ts";
import {
  createPostPayload,
  getPostId,
  validatePostInput,
} from "../_shared/posts.ts";

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { adminToken, post } = await req.json();

    if (!adminToken || typeof adminToken !== "string") {
      return jsonResponse({ error: "Admin token is required" }, 400);
    }

    const validPost = validatePostInput(post);

    const supabase = createServiceClient();
    const session = await getValidSession(supabase, adminToken, "admin");

    const postId = getPostId(validPost);
    const payload = createPostPayload(validPost, session.organization_id);

    const query = postId
      ? supabase
          .from("posts")
          .update(payload)
          .eq("id", postId)
          .eq("organization_id", session.organization_id)
          .select()
          .single()
      : supabase.from("posts").insert(payload).select().single();

    const { data: savedPost, error } = await query;

    if (error) throw error;

    return jsonResponse({ post: savedPost });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});