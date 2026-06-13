import { useEffect, useMemo, useState } from "react";
import { orgGateApi } from "../../../api";
import {
  createNewTaskPayload,
  createTaskDraft,
} from "../utils/taskDrafts";

export function useAdminTaskBoard() {
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [draftTask, setDraftTask] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const todoColumn = columns[0];

  const tasksByColumn = useMemo(() => {
    return columns.reduce((groups, column) => {
      groups[column.id] = tasks
        .filter((task) => task.column_id === column.id)
        .sort((a, b) => a.position - b.position);

      return groups;
    }, {});
  }, [columns, tasks]);

  useEffect(() => {
    loadBoard();
  }, []);

  async function loadBoard() {
    try {
      setError("");
      setLoading(true);

      const data = await orgGateApi.getOrgTasks();

      setBoard(data.board);
      setColumns(data.columns || []);
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }

  async function createTask(event) {
    event.preventDefault();

    if (!todoColumn || !newTaskTitle.trim()) return;

    try {
      setError("");

      const todoTasks = tasksByColumn[todoColumn.id] || [];

      const created = await orgGateApi.saveAdminTask(
        createNewTaskPayload({
          title: newTaskTitle,
          columnId: todoColumn.id,
          position: todoTasks.length,
        })
      );

      setTasks((current) => [...current, created]);
      setNewTaskTitle("");
    } catch (err) {
      setError(err.message || "Failed to create task.");
    }
  }

  function startEditing(task) {
    setEditingTaskId(task.id);
    setDraftTask(createTaskDraft(task));
  }

  function cancelEditing() {
    setEditingTaskId(null);
    setDraftTask(null);
  }

  function updateDraft(field, value) {
    setDraftTask((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveTask() {
    if (!draftTask) return;

    try {
      setError("");

      const saved = await orgGateApi.saveAdminTask(draftTask);

      setTasks((current) =>
        current.map((task) => (task.id === saved.id ? saved : task))
      );

      cancelEditing();
    } catch (err) {
      setError(err.message || "Failed to save task.");
    }
  }

  async function deleteTask(taskId) {
    if (!confirm("Delete this task?")) return;

    try {
      setError("");

      await orgGateApi.deleteAdminTask(taskId);

      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch (err) {
      setError(err.message || "Failed to delete task.");
    }
  }

  async function moveTask(task, targetColumnId) {
    if (task.column_id === targetColumnId) return;

    try {
      setError("");

      const targetTasks = tasksByColumn[targetColumnId] || [];

      const saved = await orgGateApi.saveAdminTask({
        id: task.id,
        title: task.title,
        description: task.description || "",
        priority: task.priority || "medium",
        columnId: targetColumnId,
        position: targetTasks.length,
      });

      setTasks((current) =>
        current.map((item) => (item.id === saved.id ? saved : item))
      );
    } catch (err) {
      setError(err.message || "Failed to move task.");
    }
  }

  async function dropTask(taskId, targetColumnId) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    await moveTask(task, targetColumnId);
  }

  return {
    board,
    columns,
    tasksByColumn,
    todoColumn,
    newTaskTitle,
    editingTaskId,
    draftTask,
    error,
    loading,
    setNewTaskTitle,
    createTask,
    startEditing,
    cancelEditing,
    updateDraft,
    saveTask,
    deleteTask,
    moveTask,
    dropTask,
  };
}