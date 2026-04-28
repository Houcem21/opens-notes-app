export const emptyPostForm = {
  title: "",
  summary: "",
  category: "general",
  content: "",
  status: "draft",
};

export function createEmptyPostForm() {
  return { ...emptyPostForm };
}