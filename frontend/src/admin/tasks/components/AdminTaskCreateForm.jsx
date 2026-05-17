export default function AdminTaskCreateForm({
  value,
  disabled,
  onChange,
  onSubmit,
}) {
  if (disabled) return null;

  return (
    <form className="adminTaskCreateForm" onSubmit={onSubmit}>
      <input
        className="input"
        value={value}
        placeholder="New task..."
        onChange={(e) => onChange(e.target.value)}
      />

      <button className="btn" type="submit">
        Add to To Do
      </button>
    </form>
  );
}