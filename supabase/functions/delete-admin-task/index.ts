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
    const { adminToken, taskId } = await req.json();

    if (!adminToken || typeof adminToken !== "string") {
      return jsonResponse({ error: "Admin token is required" }, 400);
    }

    if (!taskId || typeof taskId !== "string") {
      return jsonResponse({ error: "Task id is required" }, 400);
    }

    const supabase = createServiceClient();
    const session = await getValidSession(supabase, adminToken, "admin");

    const { data: boards, error: boardsError } = await supabase
      .from("task_boards")
      .select("id")
      .eq("organization_id", session.organization_id);

    if (boardsError) throw boardsError;

    const boardIds = (boards || []).map((board) => board.id);

    if (boardIds.length === 0) {
      return jsonResponse({ ok: true });
    }

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .in("board_id", boardIds);

    if (error) throw error;

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});