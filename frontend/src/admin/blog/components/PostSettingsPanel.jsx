export default function PostSettingsPanel({
  form,
  selectedPost,
  onUpdateField,
  onSavePost,
  onDeletePage,
  onDeletePost,
}) {
  return (
    <>
      <h2>Settings</h2>

      <label className="settingsLabel">Status</label>
      <select
        className="settingsInput"
        value={form.status}
        onChange={(e) => onUpdateField("status", e.target.value)}
      >
        <option value="draft">draft</option>
        <option value="published">published</option>
      </select>

      <label className="settingsLabel">Category</label>
      <input
        className="settingsInput"
        value={form.category}
        onChange={(e) => onUpdateField("category", e.target.value)}
      />

      <div className="settingsDivider" />

      <button className="btn savePostBtn" onClick={onSavePost}>
        Save post
      </button>

      <button className="btn btnDanger" onClick={onDeletePage}>
        Delete current page
      </button>

      {selectedPost && (
        <button className="btn btnDanger" onClick={onDeletePost}>
          Delete post
        </button>
      )}
    </>
  );
}