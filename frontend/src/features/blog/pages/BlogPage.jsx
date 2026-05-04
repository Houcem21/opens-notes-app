import { useEffect, useState, useRef } from "react";
import { postsApi } from "../../../api/posts";
import ErrorMessage from "../../../common/components/ErrorMessage";
import { sanitizeHtml } from "../../../common/utils/sanitizeHtml";
import "../styles/blog.css";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [error, setError] = useState("");

  const selectedPost =
    posts.find((post) => post._id === selectedPostId) || posts[0];

  const pages = selectedPost?.pages || [];
  const activePage = pages[activePageIndex];

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const contentRef = useRef(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        setError("");
        const data = await postsApi.getPublishedPosts();
        setPosts(data);
        if (data.length > 0) setSelectedPostId(data[0]._id);
      } catch (err) {
        setError(err.message);
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
    setSelectedPostId(post._id);
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
    <div className={`blogPage ${!sidebarOpen ? "blogSidebarClosed" : ""}`}>
      <button
        className="blogSidebarToggle"
        onClick={() => setSidebarOpen((value) => !value)}
      >
        {sidebarOpen ? "‹" : "›"}
      </button>
      <aside className="blogList">
        <h2 className="blogListTitle">Docs</h2>

        <ErrorMessage message={error} />

        {posts.length === 0 && (
          <p className="blogEmpty">Keine veröffentlichten Posts.</p>
        )}

        <ul className="blogListPosts">
          {posts.map((post) => (
            <li className="blogListPostsItem" key={post._id}>
              <button
                className={`blogListItem ${
                  selectedPost?._id === post._id ? "active" : ""
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
          <div className="blogPlaceholder">
            <h1>Willkommen</h1>
            <p>Wähle einen Artikel, um zu starten.</p>
          </div>
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
    </div>
  );
}