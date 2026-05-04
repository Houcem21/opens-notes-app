import { supabase } from "./supabase";
import { requireOk, requireData } from "../common/utils/supabaseResult";

import {normalizeBoard, normalizeColumn, normalizeTask} from "./mappers/taskMapper"

import { requireCurrentUser } from "../common/utils/currentUser";

export const tasksApi = {
  async getBoards() {
    const data = requireData(await supabase
      .from("task_boards")
      .select("*")
      .order("created_at", { ascending: true })
    );
    return data.map(normalizeBoard);
  },

  async createBoard({ title }) {
    const user = requireCurrentUser();
    
    const data = requireData(await supabase
      .from("task_boards")
      .insert({
        title,
        owner_id: user.id,
      })
      .select()
      .single());

    return normalizeBoard(data);
  },

  async getColumns(boardId) {
    const data = requireData(await supabase
      .from("task_columns")
      .select("*")
      .eq("board_id", boardId)
      .order("position", { ascending: true }));

    return data.map(normalizeColumn);
  },

  async createColumn({ boardId, title, position = 0 }) {
    const data = requireData(await supabase
      .from("task_columns")
      .insert({
        board_id: boardId,
        title,
        position,
      })
      .select()
      .single());

    return normalizeColumn(data);
  },

  async updateColumn(columnId, updates) {
    const payload = {
      updated_at: new Date().toISOString(),
    };

    if (typeof updates.title === "string") payload.title = updates.title;
    if (typeof updates.position === "number") payload.position = updates.position;

    const data = requireData(await supabase
      .from("task_columns")
      .update(payload)
      .eq("id", columnId)
      .select()
      .single());

    return normalizeColumn(data);
  },

  async deleteColumn(columnId) {
    return requireOk(await supabase
      .from("task_columns")
      .delete()
      .eq("id", columnId)
    );
  },

  async getTasks(boardId) {
    const data = requireData(await supabase
      .from("tasks")
      .select("*")
      .eq("board_id", boardId)
      .order("position", { ascending: true }));

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
    const data = requireData(await supabase
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
      .single());

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

    const data = requireData(await supabase
      .from("tasks")
      .update(payload)
      .eq("id", taskId)
      .select()
      .single());

    return normalizeTask(data);
  },

  async deleteTask(taskId) {
    return requireOk(
      await supabase.from("tasks").delete().eq("id", taskId)
    );
  },
};