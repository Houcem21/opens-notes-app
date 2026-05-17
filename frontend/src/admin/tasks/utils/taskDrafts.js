export function createTaskDraft(task) {
  return {
    id: task.id,
    title: task.title || "",
    description: task.description || "",
    priority: task.priority || "medium",
    columnId: task.column_id,
    position: task.position || 0,
  };
}

export function createNewTaskPayload({ title, columnId, position }) {
  return {
    title: title.trim(),
    description: "",
    priority: "medium",
    columnId,
    position,
  };
}