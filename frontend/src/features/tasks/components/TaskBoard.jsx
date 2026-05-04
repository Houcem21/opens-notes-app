import { useEffect, useState } from "react";
import { useSupabaseAuth } from "../../../common/hooks/useSupabaseAuth";
import ErrorMessage from "../../../common/components/ErrorMessage";
import TaskColumn from "./TaskColumn";

import AuthForm from "../../../common/components/AuthForm";

import { useTaskBoard } from "../hooks/useTaskBoard";

export default function TaskBoard() {
    const [error, setError] = useState("");

    const { isLoggedIn, authLoading, login, logout } = useSupabaseAuth();

    const {
        board,
        columns,
        tasksByColumn,
        boardLoading,
        boardError,
        createTask,
        moveTaskToColumn,
        updateTask,
        deleteTask,
        clearBoard,
    } = useTaskBoard({ isLoggedIn });


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
        clearBoard();
    }


    if (authLoading || boardLoading) {
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

        <ErrorMessage message={error || boardError} />

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