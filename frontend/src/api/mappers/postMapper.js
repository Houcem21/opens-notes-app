import { timestampsFrom } from "../../common/utils/dateMapping";
import { createUniqueSlug } from "../../common/utils/slug";

export function normalizePost(post) {
  return {
    ...post,
    _id: post.id,
    ...timestampsFrom(post),
    pages: normalizePages(post),
  };
}

export function createPostPayload(postData) {
  const pages = normalizeInputPages(postData);

  return {
    title: postData.title,
    slug: postData.slug || createUniqueSlug(postData.title),
    summary: postData.summary || "",
    category: postData.category || "general",
    status: postData.status || "draft",
    pages,
    content: pages[0]?.content || "",
    updated_at: new Date().toISOString(),
  };
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

function normalizeInputPages(postData) {
  if (Array.isArray(postData.pages) && postData.pages.length > 0) {
    return postData.pages;
  }

  return [{ title: "Page 1", content: postData.content || "" }];
}