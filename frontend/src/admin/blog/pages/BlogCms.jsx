import { useEffect, useState } from "react";
import { createEmptyPostForm } from "../../../domains/blog/constants/postDefaults";
import PostDocumentEditor from "../components/PostDocumentEditor";

import "../../styles/admin.css"

import { orgGateApi } from "../../../api";

import {useSession} from "../../../common/session/useSession";

import SplitEditorLayout from "../layout/SplitEditorLayout";
import PostQueueSidebar from "../components/PostQueueSidebar";
import PostSettingsPanel from "../components/PostSettingsPanel";
import LoadingScreen from "../../../common/feedback/LoadingScreen";

export default function BlogCms() {
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [form, setForm] = useState(createEmptyPostForm());
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const selectedPost = posts.find((post) => post.id === selectedPostId);
  const activePage = form.pages?.[activePageIndex];


  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const { handleApiError, clearAdmin
   } = useSession();

  async function loadPosts() {
    try {
      setError("");
      setLoading(true);

      const data = await orgGateApi.getAdminPosts();
      setPosts(data);
    } catch (err) {
      if (handleApiError(err)) return;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

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
      if (handleApiError(err)) return;
      setError(err.message);
    }
  }

  async function deletePost() {
    if (!selectedPost) return;
    if (!confirm("Diesen Beitrag löschen?")) return;

    try {
      setError("");
      await orgGateApi.deleteAdminPost(selectedPost.id);
      await loadPosts();
      startNewPost();
    } catch (err) {
      if (handleApiError(err)) return;
      setError(err.message);
    }
  }

  return (
    <>
      <LoadingScreen visible={loading} />

      {!loading && (
        <SplitEditorLayout
          leftOpen={leftOpen}
          rightOpen={rightOpen}
          onToggleLeft={() => setLeftOpen((value) => !value)}
          onToggleRight={() => setRightOpen((value) => !value)}
          left={
            <PostQueueSidebar
              posts={posts}
              selectedPostId={selectedPostId}
              onSelectPost={selectPost}
              onCreatePost={startNewPost}
              onLogout={clearAdmin}
            />
          }
          main={
            <PostDocumentEditor
              error={error}
              form={form}
              activePage={activePage}
              activePageIndex={activePageIndex}
              onUpdateField={updateField}
              onUpdateActivePage={updateActivePage}
              onSelectPage={setActivePageIndex}
              onAddPage={addPage}
            />
          }
          right={
            <PostSettingsPanel
              form={form}
              selectedPost={selectedPost}
              onUpdateField={updateField}
              onSavePost={savePost}
              onDeletePage={deleteActivePage}
              onDeletePost={deletePost}
            />
          }
        />
      )}
    </>
  );
}