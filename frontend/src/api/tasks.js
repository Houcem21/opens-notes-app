import { supabase } from "./supabase";
import { timestampsFrom } from "../common/utils/dateMapping";

function normalizeBoard(board) {
  return {
    ...board,
    id: board.id,
    title: board.title,
    ownerId: board.owner_id,
    ...timestampsFrom(board),
  };
}

function normalizeColumn(column) {
  return {
    ...column,
    id: column.id,
    boardId: column.board_id,
    title: column.title,
    position: column.position,
    ...timestampsFrom(column),
  };
}

function normalizeTask(task) {
  return {
    ...task,
    id: task.id,
    boardId: task.board_id,
    columnId: task.column_id,
    title: task.title,
    description: task.description || "",
    priority: task.priority || "medium",
    position: task.position,
    dueDate: task.due_date,
    ...timestampsFrom(task),
  };
}

export const tasksApi = {
  async getBoards() {
    const { data, error } = await supabase
      .from("task_boards")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data.map(normalizeBoard);
  },

  async createBoard({ title }) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error("Login required");

    const { data, error } = await supabase
      .from("task_boards")
      .insert({
        title,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return normalizeBoard(data);
  },

  async getColumns(boardId) {
    const { data, error } = await supabase
      .from("task_columns")
      .select("*")
      .eq("board_id", boardId)
      .order("position", { ascending: true });

    if (error) throw error;
    return data.map(normalizeColumn);
  },

  async createColumn({ boardId, title, position = 0 }) {
    const { data, error } = await supabase
      .from("task_columns")
      .insert({
        board_id: boardId,
        title,
        position,
      })
      .select()
      .single();

    if (error) throw error;
    return normalizeColumn(data);
  },

  async updateColumn(columnId, updates) {
    const payload = {
      updated_at: new Date().toISOString(),
    };

    if (typeof updates.title === "string") payload.title = updates.title;
    if (typeof updates.position === "number") payload.position = updates.position;

    const { data, error } = await supabase
      .from("task_columns")
      .update(payload)
      .eq("id", columnId)
      .select()
      .single();

    if (error) throw error;
    return normalizeColumn(data);
  },

  async deleteColumn(columnId) {
    const { error } = await supabase
      .from("task_columns")
      .delete()
      .eq("id", columnId);

    if (error) throw error;
    return { ok: true };
  },

  async getTasks(boardId) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("board_id", boardId)
      .order("position", { ascending: true });

    if (error) throw error;
    return data.map(normalizeTask);
  },

  async createTask({
    boardId,
    columnId,
    title,
    description = "",
    priority = "medium",
    position = 0,
    dueDate = null,
  }) {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        board_id: boardId,
        column_id: columnId,
        title,
        description,
        priority,
        position,
        due_date: dueDate,
      })
      .select()
      .single();

    if (error) throw error;
    return normalizeTask(data);
  },

  async updateTask(taskId, updates) {
    const payload = {
      updated_at: new Date().toISOString(),
    };

    if (typeof updates.title === "string") payload.title = updates.title;
    if (typeof updates.description === "string") payload.description = updates.description;
    if (typeof updates.priority === "string") payload.priority = updates.priority;
    if (typeof updates.position === "number") payload.position = updates.position;

    if ("columnId" in updates) payload.column_id = updates.columnId;
    if ("dueDate" in updates) payload.due_date = updates.dueDate;

    const { data, error } = await supabase
      .from("tasks")
      .update(payload)
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw error;
    return normalizeTask(data);
  },

  async deleteTask(taskId) {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) throw error;
    return { ok: true };
  },
};