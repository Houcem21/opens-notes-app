import { useEffect, useState } from "react";
import { postsApi } from "../../api/posts";
import ErrorMessage from "../../common/components/ErrorMessage"
import { createEmptyPostForm } from "../../common/constants/postDefaults";
import { supabase } from "../../api/supabase";

import "../styles/admin.css";
export default function BlogCms() {
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [form, setForm] = useState(createEmptyPostForm());
  const [error, setError] = useState("");

  const selectedPost = posts.find((post) => post._id === selectedPostId);

  const [needsLogin, setNeedsLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

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

  async function handleLogout() {
    await supabase.auth.signOut();
    setPosts([]);
    setNeedsLogin(true);
  }

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

  useEffect(() => {
    loadPosts();
  }, []);

  function selectPost(post) {
    setSelectedPostId(post._id);
    setForm({...post} || createEmptyPostForm());
  }

  function startNewPost() {
    setSelectedPostId(null);
    setForm(createEmptyPostForm());
  }

  async function savePost() {
    try {
      setError("");

      if (!form.title.trim()) {
        setError("Titel ist erforderlich.");
        return;
      }

      if (selectedPost) {
        await postsApi.updatePost(selectedPost._id, form)
      } else {
        await postsApi.createPost(form);
      }

      await loadPosts();
      startNewPost();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deletePost() {
    if (!selectedPost) return;
    if (!confirm("Diesen Post löschen?")) return;

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
    <div className="cmsPage">
      <aside className="cmsSidebar">
        <div className="cmsHeader">
          <h2>Blog CMS</h2>
          <button onClick={startNewPost}>Neu</button>
          <button onClick={handleLogout}>Logout</button>
        </div>

        {posts.map((post) => (
          <button
            key={post._id}
            className={`postListItem ${
              post._id === selectedPostId ? "active" : ""
            }`}
            onClick={() => selectPost(post)}
          >
            <strong>{post.title}</strong>
            <span>{post.status}</span>
          </button>
        ))}
      </aside>

      <section className="cmsEditor">
        <h1>{selectedPost ? "Post bearbeiten" : "Neuen Post erstellen"}</h1>

        <ErrorMessage message={error} />

        <label htmlFor="titleInput" className="formLabel">Titel</label>
        <input
          id="titleInput"
          className="formInput"
          value={form.title}
          onChange={(e) =>
            setForm((current) => ({ ...current, title: e.target.value }))
          }
        />

        <label className="formLabel">Zusammenfassung (summary)</label>
        <input
          className="formInput"
          value={form.summary}
          onChange={(e) =>
            setForm((current) => ({ ...current, summary: e.target.value }))
          }
        />

        <label className="formLabel">Kategorie (category)</label>
        <input
          className="formInput"
          value={form.category}
          onChange={(e) =>
            setForm((current) => ({ ...current, category: e.target.value }))
          }
        />

        <label className="formLabel">Status</label>
        <select
          className="formSelect"
          value={form.status}
          onChange={(e) =>
            setForm((current) => ({ ...current, status: e.target.value }))
          }
        >
          <option value="draft">draft</option>
          <option value="published">published</option>
        </select>

        <label className="formLabel">Inhalt (content)</label>
        <textarea
          className="formTextarea"
          rows={14}
          value={form.content}
          onChange={(e) =>
            setForm((current) => ({ ...current, content: e.target.value }))
          }
        />

        <div className="cmsActions">
          <button onClick={savePost}>Speichern</button>
          {selectedPost && (
            <button className="dangerButton" onClick={deletePost}>
              Löschen
            </button>
          )}
        </div>
      </section>
    </div>
  );
}