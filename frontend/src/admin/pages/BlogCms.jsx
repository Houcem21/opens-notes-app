import { useEffect, useState } from "react";
import { postsApi } from "../../api/posts";
import ErrorMessage from "../../common/components/ErrorMessage"
import { createEmptyPostForm } from "../../common/constants/postDefaults";

import "../styles/admin.css";
export default function BlogCms() {
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [form, setForm] = useState(createEmptyPostForm());
  const [error, setError] = useState("");

  const selectedPost = posts.find((post) => post._id === selectedPostId);

  async function loadPosts() {
    try {
      setError("");
      const data = await postsApi.getAdminPosts();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    }
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

  return (
    <div className="cmsPage">
      <aside className="cmsSidebar">
        <div className="cmsHeader">
          <h2>Blog CMS</h2>
          <button onClick={startNewPost}>Neu</button>
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