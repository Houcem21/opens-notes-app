import { useEffect, useState } from "react";
import ErrorMessage from "../../../common/components/ErrorMessage";
import { createEmptyPostForm } from "../../../common/constants/postDefaults";
import RichTextEditor from "../components/editor/RichTextEditor";

import AuthForm from "../../../common/components/AuthForm";
import "../../styles/admin.css"

import AdminGate from "../../../common/components/AdminGate";
import OrgGate from "../../../common/components/OrgGate";
import { orgGateApi } from "../../../api/orgGate";

export default function BlogCms() {
  const [activeOrg, setActiveOrg] = useState(orgGateApi.getActiveOrg());
  const [adminToken, setAdminToken] = useState(orgGateApi.getAdminToken());

  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [form, setForm] = useState(createEmptyPostForm());
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [error, setError] = useState("");

  const selectedPost = posts.find((post) => post.id === selectedPostId);
  const activePage = form.pages?.[activePageIndex];


  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);


  async function loadPosts() {
    try {
      if (!activeOrg || !adminToken) return;

      const data = await orgGateApi.getAdminPosts();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadPosts();
  }, [activeOrg, adminToken]);

  function selectPost(post) {
    setSelectedPostId(post.id);
    setForm({
      title: post.title || "",
      summary: post.summary || "",
      category: post.category || "general",
      status: post.status || "draft",
      pages:
        Array.isArray(post.pages) && post.pages.length > 0
          ? post.pages
          : [{ title: "Page 1", content: post.content || "" }],
    });
    setActivePageIndex(0);
  }

  function startNewPost() {
    setSelectedPostId(null);
    setForm(createEmptyPostForm());
    setActivePageIndex(0);
    setError("");
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateActivePage(field, value) {
    setForm((current) => {
      const pages = [...current.pages];
      pages[activePageIndex] = {
        ...pages[activePageIndex],
        [field]: value,
      };

      return { ...current, pages };
    });
  }

  function addPage() {
    setForm((current) => {
      const pageNumber = current.pages.length + 1;
      const pages = [
        ...current.pages,
        { title: `Page ${pageNumber}`, content: "" },
      ];

      setActivePageIndex(pages.length - 1);
      return { ...current, pages };
    });
  }

  function deleteActivePage() {
    if (form.pages.length === 1) {
      setError("Ein Beitrag braucht mindestens eine Seite.");
      return;
    }

    if (!confirm("Diese Seite löschen?")) return;

    setForm((current) => {
      const pages = current.pages.filter((_, index) => index !== activePageIndex);
      setActivePageIndex(Math.max(0, activePageIndex - 1));
      return { ...current, pages };
    });
  }

  async function savePost() {
    try {
      setError("");

      if (!form.title.trim()) {
        setError("Titel ist erforderlich.");
        return;
      }

      if (!form.pages || form.pages.length === 0) {
        setError("Mindestens eine Seite ist erforderlich.");
        return;
      }

      let savedPost;

      if (selectedPost) {
        savedPost = await orgGateApi.saveAdminPost({
          ...form,
          id: selectedPost.id,
        });
      } else {
        savedPost = await orgGateApi.saveAdminPost(form);
      }

      await loadPosts();

      setSelectedPostId(savedPost.id);
      setForm(savedPost);
    } catch (err) {
      setError(err.message);
    }
  }

  async function deletePost() {
    if (!selectedPost) return;
    if (!confirm("Diesen Beitrag löschen?")) return;

    try {
      setError("");
      await orgGateApi.deletePost(selectedPost.id);
      await loadPosts();
      startNewPost();
    } catch (err) {
      setError(err.message);
    }
  }


  if (!activeOrg) {
    return (
      <OrgGate
        onSuccess={() => {
          window.location.reload();
        }}
      />
    );
  }

  if (!adminToken) {
    return (
      <AdminGate
        onSuccess={(token) => {
          setAdminToken(token);
        }}
      />
    );
  }

  return (
    <div
      className={`editorShell ${!leftOpen ? "leftClosed" : ""} ${
        !rightOpen ? "rightClosed" : ""
      }`}
    >
      <button
        className="sidebarToggle leftToggle"
        onClick={() => setLeftOpen((value) => !value)}
      >
        {leftOpen ? "‹" : "›"}
      </button>

      <button
        className="sidebarToggle rightToggle"
        onClick={() => setRightOpen((value) => !value)}
      >
        {rightOpen ? "›" : "‹"}
      </button>
      <aside className="postQueue">
        <div className="postQueueHeader">
          <h2>Posts</h2>
          <button className="btn" onClick={startNewPost}>New</button>
        </div>

        <div className="postQueueList">
          {posts.map((post) => (
            <button
              key={post.id}
              className={`postQueueItem ${
                post.id === selectedPostId ? "active" : ""
              }`}
              onClick={() => selectPost(post)}
            >
              <strong>{post.title}</strong>
              <span>{post.status}</span>
            </button>
          ))}
        </div>

        <button
          className="btn btnSecondary logoutBtn"
          onClick={() => {
            orgGateApi.clearAdminSession();
            window.location.reload();
          }}
        >
          Logout
        </button>
      </aside>

      <main className="documentEditor">
        <ErrorMessage message={error} />

        <input
          className="documentTitle"
          value={form.title}
          placeholder="Untitled post"
          onChange={(e) => updateField("title", e.target.value)}
        />

        <textarea
          className="documentSummary"
          value={form.summary}
          placeholder="Short summary..."
          onChange={(e) => updateField("summary", e.target.value)}
        />

        <div className="pageBar">
          <div className="pageTabs">
            {form.pages.map((page, index) => (
              <button
                key={index}
                className={`pageTab ${index === activePageIndex ? "active" : ""}`}
                onClick={() => setActivePageIndex(index)}
              >
                {page.title || `Page ${index + 1}`}
              </button>
            ))}
          </div>

          <button className="btn" onClick={addPage}>
            + Page
          </button>
        </div>

        {activePage && (
          <section className="pageDocument">
            <input
              className="pageTitleInput"
              value={activePage.title}
              placeholder="Page title"
              onChange={(e) => updateActivePage("title", e.target.value)}
            />

            <RichTextEditor
              value={activePage.content}
              onChange={(html) => updateActivePage("content", html)}
            />
          </section>
        )}
      </main>

      <aside className="editorSettings">
        <h2>Settings</h2>

        <label className="settingsLabel">Status</label>
        <select
          className="settingsInput"
          value={form.status}
          onChange={(e) => updateField("status", e.target.value)}
        >
          <option value="draft">draft</option>
          <option value="published">published</option>
        </select>

        <label className="settingsLabel">Category</label>
        <input
          className="settingsInput"
          value={form.category}
          onChange={(e) => updateField("category", e.target.value)}
        />

        <div className="settingsDivider" />

        <button className="btn savePostBtn" onClick={savePost}>
          Save post
        </button>

        <button className="btn btnDanger" onClick={deleteActivePage}>
          Delete current page
        </button>

        {selectedPost && (
          <button className="btn btnDanger" onClick={deletePost}>
            Delete post
          </button>
        )}
      </aside>
    </div>
  );
}