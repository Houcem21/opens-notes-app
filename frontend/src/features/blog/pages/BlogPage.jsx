import { useEffect, useState, useRef } from "react";
import ErrorMessage from "../../../common/components/ErrorMessage";
import { sanitizeHtml } from "../../../common/utils/sanitizeHtml";
import "../styles/blog.css";

import { orgGateApi } from "../../../api";
import { useSession } from "../../../common/session/useSession";
import SidebarToggleBtn from "../components/SidebarToggleBtn";
import LoadingScreen from "../../../common/components/loading/LoadingScreen";
import EmptyState from "../../../common/ui/EmptyState";
export default function BlogPage() {

  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  
  const selectedPost =
    posts.find((post) => (post.id) === selectedPostId) || posts[0];

  const pages = selectedPost?.pages || [];
  const activePage = pages[activePageIndex];

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);
    
  const { handleApiError } = useSession();


  useEffect(() => {
    async function loadPosts() {
      try {
        setError("");
        setLoading(true);

        const data = await orgGateApi.getOrgPosts();
        setPosts(data);
        if (data.length > 0) setSelectedPostId(data[0].id);
      } catch (err) {
        if (handleApiError(err)) return;
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  function scrollBlogToTop() {
    requestAnimationFrame(() => {
      contentRef.current?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  useEffect(() => {
    scrollBlogToTop();
  }, [selectedPostId, activePageIndex]);

  function selectPost(post) {
    setSelectedPostId(post.id);
    setActivePageIndex(0);
  }

  function goPreviousPage() {
    setActivePageIndex((current) => Math.max(0, current - 1));
  }

  function goNextPage() {
    setActivePageIndex((current) =>
      Math.min(pages.length - 1, current + 1)
    );
  }

  return (
    <>
      <LoadingScreen visible={loading} />

      {!loading && ( posts.length === 0 ? (
        <EmptyState
          eyebrow="Documentation"
          title="No posts yet"
          description="This organization has not published documentation yet."
        />) : (
        <div className={`blogPage ${!sidebarOpen ? "blogSidebarClosed" : ""}`}>
          <SidebarToggleBtn fn={() => setSidebarOpen((value) => !value)} open={sidebarOpen} />
          <aside className="blogList">
            <h2 className="blogListTitle">Docs</h2>

            <ErrorMessage message={error} />

            {posts.length === 0 && (
              <p className="blogEmpty">No Posts</p>
            )}

            <ul className="blogListPosts">
              {posts.map((post) => (
                <li className="blogListPostsItem" key={post.id}>
                  <button
                    className={`blogListItem ${
                      selectedPost?.id === post.id ? "active" : ""
                    }`}
                    onClick={() => selectPost(post)}
                  >
                    <strong>{post.title}</strong>
                    <span>{post.category}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <main className="blogContent" ref={contentRef}>
            {!selectedPost || !activePage ? (
              <p className="blogEmpty">No content available.</p>
            ) : (
            <article>
              <div className="blogCategory">{selectedPost.category}</div>
              <h1>{selectedPost.title}</h1>

              {selectedPost.summary && (
                <p className="blogSummary">{selectedPost.summary}</p>
              )}

              <div className="blogPageCounter">
                Page {activePageIndex + 1} of {pages.length}
              </div>

              <h2>{activePage.title}</h2>

              <div
                className="blogBody"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(activePage.content),
                }}            
              />

              <div className="blogPageControls">
                <button
                  onClick={goPreviousPage}
                  disabled={activePageIndex === 0}
                >
                  Previous
                </button>

                <button
                  onClick={goNextPage}
                  disabled={activePageIndex >= pages.length - 1}
                >
                  Next
                </button>
              </div>
            </article>
            )}
          </main>
        </div>)
      )}
    </>
  );
}