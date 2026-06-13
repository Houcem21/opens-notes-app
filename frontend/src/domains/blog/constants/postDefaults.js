export const emptyPostPage = {
  title: "Page 1",
  content: "",
};

export const emptyPostForm = {
  title: "",
  summary: "",
  category: "general",
  status: "draft",
  pages: [emptyPostPage],
};

export function createEmptyPostForm() {
  return {
    ...emptyPostForm,
    pages: [{ ...emptyPostPage }],
  };
}