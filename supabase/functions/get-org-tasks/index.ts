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
    const { orgToken } = await req.json();

    if (!orgToken || typeof orgToken !== "string") {
      return jsonResponse({ error: "Org token is required" }, 400);
    }

    const supabase = createServiceClient();
    const session = await getValidSession(supabase, orgToken, "org");

    const { data: boards, error: boardsError } = await supabase
      .from("task_boards")
      .select("*")
      .eq("organization_id", session.organization_id)
      .order("created_at", { ascending: true });

    if (boardsError) throw boardsError;

    const board = boards?.[0] || null;

    if (!board) {
      return jsonResponse({
        board: null,
        columns: [],
        tasks: [],
      });
    }

    const { data: columns, error: columnsError } = await supabase
      .from("task_columns")
      .select("*")
      .eq("board_id", board.id)
      .order("position", { ascending: true });

    if (columnsError) throw columnsError;

    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("board_id", board.id)
      .order("position", { ascending: true });

    if (tasksError) throw tasksError;

    return jsonResponse({
      board,
      columns: columns || [],
      tasks: tasks || [],
    });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});