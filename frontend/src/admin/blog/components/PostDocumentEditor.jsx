import ErrorMessage from "../../../common/components/ErrorMessage";
import RichTextEditor from "./editor/RichTextEditor";

export default function PostDocumentEditor({
  error,
  form,
  activePage,
  activePageIndex,
  onUpdateField,
  onUpdateActivePage,
  onSelectPage,
  onAddPage,
}) {
  return (
    <>
      <ErrorMessage message={error} />

      <input
        className="documentTitle"
        value={form.title}
        placeholder="Untitled post"
        onChange={(e) => onUpdateField("title", e.target.value)}
      />

      <textarea
        className="documentSummary"
        value={form.summary}
        placeholder="Short summary..."
        onChange={(e) => onUpdateField("summary", e.target.value)}
      />

      <div className="pageBar">
        <div className="pageTabs">
          {form.pages.map((page, index) => (
            <button
              key={index}
              className={`pageTab ${index === activePageIndex ? "active" : ""}`}
              onClick={() => onSelectPage(index)}
            >
              {page.title || `Page ${index + 1}`}
            </button>
          ))}
        </div>

        <button className="btn" onClick={onAddPage}>
          + Page
        </button>
      </div>

      {activePage && (
        <section className="pageDocument">
          <input
            className="pageTitleInput"
            value={activePage.title}
            placeholder="Page title"
            onChange={(e) => onUpdateActivePage("title", e.target.value)}
          />

          <RichTextEditor
            value={activePage.content}
            onChange={(html) => onUpdateActivePage("content", html)}
          />
        </section>
      )}
    </>
  );
}