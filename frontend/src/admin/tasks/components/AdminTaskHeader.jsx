export default function AdminTaskHeader({ boardTitle, onLogout }) {
  return (
    <header className="tasksHeader">
      <div>
        <p className="tasksEyebrow">Admin Tasks</p>
        <h1>{boardTitle || "Tasks"}</h1>
      </div>

      <button className="btn btnSecondary" onClick={onLogout}>
        Logout Admin
      </button>
    </header>
  );
}