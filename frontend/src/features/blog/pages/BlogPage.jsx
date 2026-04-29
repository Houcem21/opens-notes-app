import { useEffect, useState } from "react";
import { postsApi } from "../../../api/posts";
import ErrorMessage from "../../../common/components/ErrorMessage";
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
    <div className="blogPage">
      <aside className="blogList">
        <h2>Onboarding Blog</h2>

        <ErrorMessage message={error} />

        {posts.length === 0 && (
          <p className="blogEmpty">Keine veröffentlichten Posts.</p>
        )}

        {posts.map((post) => (
          <button
            key={post._id}
            className={`blogListItem ${
              selectedPost?._id === post._id ? "active" : ""
            }`}
            onClick={() => selectPost(post)}
          >
            <strong>{post.title}</strong>
            <span>{post.category}</span>
          </button>
        ))}
      </aside>

      <main className="blogContent">
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
              Seite {activePageIndex + 1} von {pages.length}
            </div>

            <h2>{activePage.title}</h2>

            <div
              className="blogBody"
              dangerouslySetInnerHTML={{ __html: activePage.content }}
            />

            <div className="blogPageControls">
              <button
                onClick={goPreviousPage}
                disabled={activePageIndex === 0}
              >
                Vorherige Seite
              </button>

              <button
                onClick={goNextPage}
                disabled={activePageIndex >= pages.length - 1}
              >
                Nächste Seite
              </button>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}