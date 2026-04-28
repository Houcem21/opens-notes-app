import { useEffect, useState } from "react";
import { postsApi } from "../../../api/posts";

import ErrorMessage from "../../../common/components/ErrorMessage";
import "../styles/blog.css";


export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [error, setError] = useState("");

  const selectedPost = posts.find((post) => post._id === selectedPostId) || posts[0];
  
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

  useEffect(() => {
    loadPosts();
  }, []);

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
            onClick={() => setSelectedPostId(post._id)}
          >
            <strong>{post.title}</strong>
            <span>{post.category}</span>
          </button>
        ))}
      </aside>

      <main className="blogContent">
        {!selectedPost ? (
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

            <div className="blogBody">
              {selectedPost.content
                .split("\n")
                .map((paragraph, index) =>
                  paragraph.trim() ? <p key={index}>{paragraph}</p> : <br key={index} />
                )}
            </div>
          </article>
        )}
      </main>
    </div>
  );
}