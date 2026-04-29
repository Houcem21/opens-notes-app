import { useEffect, useMemo, useState } from "react";
import { tasksApi } from "../../../api/tasks";
import { useSupabaseAuth } from "../../../common/hooks/useSupabaseAuth";
import ErrorMessage from "../../../common/components/ErrorMessage";
import TaskColumn from "./TaskColumn";

import AuthForm from "../../../common/components/AuthForm";

const DEFAULT_COLUMNS = ["To Do", "In Progress", "Done"];

export default function TaskBoard() {
    const [board, setBoard] = useState(null);
    const [columns, setColumns] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState("");

    const { isLoggedIn, authLoading, login, logout } = useSupabaseAuth();

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
        currentBoard = await tasksApi.createBoard({ title: "Team Tasks" });
        }

        let boardColumns = await tasksApi.getColumns(currentBoard.id);

        if (boardColumns.length === 0) {
        boardColumns = await Promise.all(
            DEFAULT_COLUMNS.map((title, index) =>
            tasksApi.createColumn({
                boardId: currentBoard.id,
                title,
                position: index,
            })
            )
        );
        }

        const boardTasks = await tasksApi.getTasks(currentBoard.id);

        setBoard(currentBoard);
        setColumns(boardColumns);
        setTasks(boardTasks);
    }

    async function loadBoard() {
        try {
            setError("");

            if (!isLoggedIn) return;

            await ensureBoard();
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadBoard();
    }, [isLoggedIn]);

    async function handleLogin(credentials) {
        try {
            setError("");
            await login(credentials);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleLogout() {
        await logout();
        setBoard(null);
        setColumns([]);
        setTasks([]);
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

    async function updateTask(taskId, updates) {
        const updated = await tasksApi.updateTask(taskId, updates);

        setTasks((current) =>
            current.map((task) => (task.id === taskId ? updated : task))
        );
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

    async function deleteTask(taskId) {
        if (!confirm("Diese Aufgabe löschen?")) return;

        await tasksApi.deleteTask(taskId);
        setTasks((current) => current.filter((task) => task.id !== taskId));
    }

    if (authLoading) {
        return <div className="page">Loading...</div>;
    }

    if (!isLoggedIn) {
        return (
            <AuthForm
            title="Tasks Login"
            error={error}
            onSubmit={handleLogin}
            />
        );
    }

    return (
        <div className="tasksPage">
        <header className="tasksHeader">
            <div>
            <h1>{board?.title || "Tasks"}</h1>
            <p>Simple internal task board</p>
            </div>

            <button 
                onClick={handleLogout}
                className="btn btnSecondary"
            >
                Logout
            </button>
        </header>

        <ErrorMessage message={error} />

        <main className="tasksBoard">
            {columns.map((column) => (
            <TaskColumn
                key={column.id}
                column={column}
                tasks={tasksByColumn[column.id] || []}
                onCreateTask={createTask}
                onMoveTaskToColumn={moveTaskToColumn}
                onUpdateTask={updateTask}
                canCreateTask={column.id === columns[0]?.id}
                onDeleteTask={deleteTask}
            />
            ))}
        </main>
        </div>
    );
}