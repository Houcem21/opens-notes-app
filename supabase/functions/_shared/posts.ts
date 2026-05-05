import { createUniqueSlug } from "./slug.ts";

type PostInput = {
  id?: string;
  _id?: string;
  title?: string;
  slug?: string;
  summary?: string;
  category?: string;
  status?: string;
  content?: string;
  pages?: Array<{
    title: string;
    content: string;
  }>;
};

export function getPostId(post: PostInput) {
  return post.id || post._id || null;
}

export function createPostPayload(post: PostInput, organizationId: string) {
  const pages =
    Array.isArray(post.pages) && post.pages.length > 0
      ? post.pages
      : [{ title: "Page 1", content: post.content || "" }];

  return {
    title: post.title,
    slug: post.slug || createUniqueSlug(post.title || "Untitled"),
    summary: post.summary || "",
    category: post.category || "general",
    status: post.status || "draft",
    pages,
    content: pages[0]?.content || "",
    organization_id: organizationId,
    updated_at: new Date().toISOString(),
  };
}

export function validatePostInput(post: unknown) {
  if (!post || typeof post !== "object") {
    throw new Error("Post is required");
  }

  const typedPost = post as PostInput;

  if (!typedPost.title || typeof typedPost.title !== "string") {
    throw new Error("Post title is required");
  }

  return typedPost;
}