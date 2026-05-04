import { useEffect, useMemo, useState } from "react";
import { tasksApi } from "../../../api/tasks";
import {
  DEFAULT_TASK_BOARD_TITLE,
  DEFAULT_TASK_COLUMNS,
} from "../../../common/constants/taskDefaults";

export function useTaskBoard({ isLoggedIn }) {
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState("");

  const tasksByColumn = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = tasks
        .filter((task) => task.columnId === column.id)
        .sort((a, b) => a.position - b.position);

      return acc;
    }, {});
  }, [columns, tasks]);

  async function ensureBoard() {
    const boards = await tasksApi.getBoards();
    let currentBoard = boards[0];

    if (!currentBoard) {
      currentBoard = await tasksApi.createBoard({
        title: DEFAULT_TASK_BOARD_TITLE,
      });
    }

    let boardColumns = await tasksApi.getColumns(currentBoard.id);

    const existingTitles = new Set(boardColumns.map((column) => column.title));

    const missingColumns = DEFAULT_TASK_COLUMNS
      .map((title, index) => ({ title, position: index }))
      .filter((column) => !existingTitles.has(column.title));

    if (missingColumns.length > 0) {
      const createdColumns = await Promise.all(
        missingColumns.map((column) =>
          tasksApi.createColumn({
            boardId: currentBoard.id,
            title: column.title,
            position: column.position,
          })
        )
      );

      boardColumns = [...boardColumns, ...createdColumns];
    }

    boardColumns = boardColumns.sort((a, b) => a.position - b.position);

    const boardTasks = await tasksApi.getTasks(currentBoard.id);

    setBoard(currentBoard);
    setColumns(boardColumns);
    setTasks(boardTasks);
  }

  async function loadBoard() {
    if (!isLoggedIn) return;

    try {
      setBoardError("");
      setBoardLoading(true);
      await ensureBoard();
    } catch (err) {
      setBoardError(err.message);
    } finally {
      setBoardLoading(false);
    }
  }

  async function createTask(columnId, title) {
    if (!board) return;

    const todoColumn = columns[0];
    if (!todoColumn || columnId !== todoColumn.id) return;

    const currentTasks = tasksByColumn[columnId] || [];

    const created = await tasksApi.createTask({
      boardId: board.id,
      columnId,
      title,
      position: currentTasks.length,
    });

    setTasks((current) => [...current, created]);
  }

  async function moveTaskToColumn(taskId, targetColumnId) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    if (task.columnId === targetColumnId) return;

    const nextPosition = (tasksByColumn[targetColumnId] || []).length;

    const updated = await tasksApi.updateTask(task.id, {
      columnId: targetColumnId,
      position: nextPosition,
    });

    setTasks((current) =>
      current.map((item) => (item.id === task.id ? updated : item))
    );
  }

  async function updateTask(taskId, updates) {
    const updated = await tasksApi.updateTask(taskId, updates);

    setTasks((current) =>
      current.map((task) => (task.id === taskId ? updated : task))
    );
  }

  async function deleteTask(taskId) {
    if (!confirm("Diese Aufgabe löschen?")) return;

    await tasksApi.deleteTask(taskId);
    setTasks((current) => current.filter((task) => task.id !== taskId));
  }

  function clearBoard() {
    setBoard(null);
    setColumns([]);
    setTasks([]);
    setBoardError("");
  }

  useEffect(() => {
    loadBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return {
    board,
    columns,
    tasks,
    tasksByColumn,
    boardLoading,
    boardError,
    loadBoard,
    createTask,
    moveTaskToColumn,
    updateTask,
    deleteTask,
    clearBoard,
  };
}