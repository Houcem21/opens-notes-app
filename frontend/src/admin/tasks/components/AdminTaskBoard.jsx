import ErrorMessage from "../../../common/feedback/ErrorMessage";
import LoadingScreen from "../../../common/feedback/LoadingScreen";
import { useSession } from "../../../common/session/useSession";

import TaskBoard from "../../../domains/tasks/components/TaskBoard";
import "../../../domains/tasks/styles/tasks.css";

import AdminTaskHeader from "./AdminTaskHeader";
import AdminTaskCreateForm from "./AdminTaskCreateForm";
import AdminTaskEditPanel from "./AdminTaskEditPanel";
import { useAdminTaskBoard } from "../hooks/useAdminTaskBoard";

export default function AdminTaskBoard() {
  const { clearAdmin } = useSession();

  const {
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
  } = useAdminTaskBoard();

  return (
    <>
      <LoadingScreen visible={loading} />

      {!loading && (
        <main className="tasksPage">
          <AdminTaskHeader boardTitle={board?.title} onLogout={clearAdmin} />

          <ErrorMessage message={error} />

          <AdminTaskCreateForm
            value={newTaskTitle}
            disabled={!todoColumn}
            onChange={setNewTaskTitle}
            onSubmit={createTask}
          />

          <TaskBoard
            columns={columns}
            tasksByColumn={tasksByColumn}
            editable
            onEditTask={startEditing}
            onDeleteTask={deleteTask}
            onMoveTask={moveTask}
            onDropTask={dropTask}
          />

          {editingTaskId && (
            <AdminTaskEditPanel
              draftTask={draftTask}
              onUpdateDraft={updateDraft}
              onSave={saveTask}
              onCancel={cancelEditing}
            />
          )}
        </main>
      )}
    </>
  );
}