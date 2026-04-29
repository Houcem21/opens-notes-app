import { useEffect, useState } from "react";
import { postsApi } from "../../api/posts";
import ErrorMessage from "../../common/components/ErrorMessage";
import { createEmptyPostForm } from "../../common/constants/postDefaults";
import { supabase } from "../../api/supabase";
import RichTextEditor from "../components/editor/RichTextEditor";

import "../styles/admin.css";

export default function BlogCms() {
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [form, setForm] = useState(createEmptyPostForm());
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  const selectedPost = posts.find((post) => post._id === selectedPostId);
  const activePage = form.pages?.[activePageIndex];

  async function loadPosts() {
    try {
      setError("");

      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        setNeedsLogin(true);
        return;
      }

      const data = await postsApi.getAdminPosts();
      setPosts(data);
      setNeedsLogin(false);
    } catch (err) {
      setNeedsLogin(true);
      setError(err.message);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.username,
      password: loginForm.password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    await loadPosts();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setPosts([]);
    setSelectedPostId(null);
    setForm(createEmptyPostForm());
    setNeedsLogin(true);
  }

  function selectPost(post) {
    setSelectedPostId(post._id);
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

      if (selectedPost) {
        await postsApi.updatePost(selectedPost._id, form);
      } else {
        await postsApi.createPost(form);
      }

      await loadPosts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deletePost() {
    if (!selectedPost) return;
    if (!confirm("Diesen Beitrag löschen?")) return;

    try {
      setError("");
      await postsApi.deletePost(selectedPost._id);
      await loadPosts();
      startNewPost();
    } catch (err) {
      setError(err.message);
    }
  }

  if (needsLogin) {
    return (
      <div className="adminLoginPage">
        <form className="adminLoginCard" onSubmit={handleLogin}>
          <h1>Admin Login</h1>

          <label className="formLabel">Email</label>
          <input
            className="formInput"
            value={loginForm.username}
            onChange={(e) =>
              setLoginForm((current) => ({
                ...current,
                username: e.target.value,
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
    <div className="editorShell">
      <aside className="postQueue">
        <div className="postQueueHeader">
          <h2>Posts</h2>
          <button onClick={startNewPost}>New</button>
        </div>

        <div className="postQueueList">
          {posts.map((post) => (
            <button
              key={post._id}
              className={`postQueueItem ${
                post._id === selectedPostId ? "active" : ""
              }`}
              onClick={() => selectPost(post)}
            >
              <strong>{post.title}</strong>
              <span>{post.status}</span>
            </button>
          ))}
        </div>

        <button className="logoutButton" onClick={handleLogout}>
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

          <button className="addPageButton" onClick={addPage}>
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

        <button className="saveButton" onClick={savePost}>
          Save post
        </button>

        <button className="deletePageButton" onClick={deleteActivePage}>
          Delete current page
        </button>

        {selectedPost && (
          <button className="dangerButton" onClick={deletePost}>
            Delete post
          </button>
        )}
      </aside>
    </div>
  );
}