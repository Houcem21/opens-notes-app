import { useEffect, useMemo, useState } from "react";
import { tasksApi } from "../../../api/tasks";
import { supabase } from "../../../api/supabase";
import ErrorMessage from "../../../common/components/ErrorMessage";
import TaskColumn from "./TaskColumn";

const DEFAULT_COLUMNS = ["To Do", "In Progress", "Done"];

export default function TaskBoard() {
    const [board, setBoard] = useState(null);
    const [columns, setColumns] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [needsLogin, setNeedsLogin] = useState(false);
    const [loginForm, setLoginForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

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

        const { data } = await supabase.auth.getSession();

        if (!data.session) {
            setNeedsLogin(true);
            return;
        }

        await ensureBoard();
        setNeedsLogin(false);
        } catch (err) {
        setError(err.message);
        }
    }

    useEffect(() => {
        loadBoard();
    }, []);

    async function handleLogin(e) {
        e.preventDefault();

        const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
        });

        if (error) {
        setError(error.message);
        return;
        }

        await loadBoard();
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        setBoard(null);
        setColumns([]);
        setTasks([]);
        setNeedsLogin(true);
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

    if (needsLogin) {
        return (
        <div className="tasksLoginPage">
            <form className="tasksLoginCard" onSubmit={handleLogin}>
            <h1>Tasks Login</h1>

            <label className="formLabel">Email</label>
            <input
                className="formInput"
                value={loginForm.email}
                onChange={(e) =>
                setLoginForm((current) => ({
                    ...current,
                    email: e.target.value,
                }))
                }
            />

            <label className="formLabel">Password</label>
            <input
                className="formInput"
                type="password"
                value={loginForm.password}
                onChange={(e) =>
                setLoginForm((current) => ({
                    ...current,
                    password: e.target.value,
                }))
                }
            />

            <button type="submit">Login</button>
            <ErrorMessage message={error} />
            </form>
        </div>
        );
    }

    return (
        <div className="tasksPage">
        <header className="tasksHeader">
            <div>
            <h1>{board?.title || "Tasks"}</h1>
            <p>Simple internal task board</p>
            </div>

            <button onClick={handleLogout}>Logout</button>
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