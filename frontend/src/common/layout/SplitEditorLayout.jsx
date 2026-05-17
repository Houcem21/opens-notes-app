export default function SplitEditorLayout({
  left,
  main,
  right,
  leftOpen = true,
  rightOpen = true,
  onToggleLeft,
  onToggleRight,
}) {
  return (
    <div
      className={`editorShell ${!leftOpen ? "leftClosed" : ""} ${
        !rightOpen ? "rightClosed" : ""
      }`}
    >
      <button className="sidebarToggle leftToggle" onClick={onToggleLeft}>
        {leftOpen ? "‹" : "›"}
      </button>

      <button className="sidebarToggle rightToggle" onClick={onToggleRight}>
        {rightOpen ? "›" : "‹"}
      </button>

      <aside className="postQueue">{left}</aside>
      <main className="documentEditor">{main}</main>
      <aside className="editorSettings">{right}</aside>
    </div>
  );
}