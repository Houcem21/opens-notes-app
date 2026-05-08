import { handleOptions, jsonResponse } from "../_shared/responses.ts";
import { createServiceClient } from "../_shared/client.ts";
import { getValidSession } from "../_shared/sessions.ts";

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { adminToken, task } = await req.json();

    if (!adminToken || typeof adminToken !== "string") {
      return jsonResponse({ error: "Admin token is required" }, 400);
    }

    if (!task || typeof task !== "object") {
      return jsonResponse({ error: "Task is required" }, 400);
    }

    if (!task.title || typeof task.title !== "string") {
      return jsonResponse({ error: "Task title is required" }, 400);
    }

    const supabase = createServiceClient();
    const session = await getValidSession(supabase, adminToken, "admin");

    const { data: boards, error: boardsError } = await supabase
      .from("task_boards")
      .select("id")
      .eq("organization_id", session.organization_id)
      .order("created_at", { ascending: true });

    if (boardsError) throw boardsError;

    const board = boards?.[0];

    if (!board) {
      return jsonResponse({ error: "Task board not found" }, 404);
    }

    const payload = {
      board_id: board.id,
      column_id: task.columnId || task.column_id,
      title: task.title,
      description: task.description || "",
      priority: task.priority || "medium",
      position: Number(task.position || 0),
      due_date: task.dueDate || task.due_date || null,
      updated_at: new Date().toISOString(),
    };

    if (!payload.column_id) {
      return jsonResponse({ error: "Task column is required" }, 400);
    }

    let query;

    if (task.id) {
      query = supabase
        .from("tasks")
        .update(payload)
        .eq("id", task.id)
        .eq("board_id", board.id)
        .select()
        .single();
    } else {
      query = supabase.from("tasks").insert(payload).select().single();
    }

    const { data: savedTask, error } = await query;

    if (error) throw error;

    return jsonResponse({ task: savedTask });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});