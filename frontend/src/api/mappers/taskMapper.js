import { timestampsFrom } from "../../common/utils/dateMapping";

export function normalizeBoard(board) {
  return {
    ...board,
    ownerId: board.owner_id,
    ...timestampsFrom(board),
  };
}

export function normalizeColumn(column) {
  return {
    ...column,
    boardId: column.board_id,
    ...timestampsFrom(column),
  };
}

export function normalizeTask(task) {
  return {
    ...task,
    boardId: task.board_id,
    columnId: task.column_id,
    description: task.description || "",
    priority: task.priority || "medium",
    dueDate: task.due_date,
    ...timestampsFrom(task),
  };
}