import { useEffect, useState, useRef } from "react";
import ErrorMessage from "../../../common/components/ErrorMessage";
import { sanitizeHtml } from "../../../common/utils/sanitizeHtml";
import "../styles/blog.css";

import OrgGate from "../../../common/components/OrgGate";
import { orgGateApi } from "../../../api/orgGate";

import SidebarToggleBtn from "../components/SidebarToggleBtn";

export default function BlogPage() {
  const [activeOrg, setActiveOrg] = useState(orgGateApi.getActiveOrg());

  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [error, setError] = useState("");

  const selectedPost =
    posts.find((post) => (post.id) === selectedPostId) || posts[0];

  const pages = selectedPost?.pages || [];
  const activePage = pages[activePageIndex];

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const contentRef = useRef(null);

  useEffect(() => {
    async function loadPosts() {
      if (!activeOrg) return;

      try {
        setError("");
        const data = await orgGateApi.getOrgPosts();
        setPosts(data);
        if (data.length > 0) setSelectedPostId(data[0].id);
      } catch (err) {
        orgGateApi.clearOrgSession();
        setActiveOrg(null);
        setError(err.message);
      }
    }

    loadPosts();
  }, [activeOrg]);

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

  if (!activeOrg) {
  return (
    <OrgGate
      onSuccess={(organization) => {
        setActiveOrg(organization);
      }}
    />
  );
}

  return (
    <div className={`blogPage ${!sidebarOpen ? "blogSidebarClosed" : ""}`}>
      <SidebarToggleBtn fn={() => setSidebarOpen((value) => !value)} open={sidebarOpen} />
      <aside className="blogList">
        <h2 className="blogListTitle">Docs</h2>

        <ErrorMessage message={error} />

        {posts.length === 0 && (
          <p className="blogEmpty">No Posts.</p>
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
          <div className="blogPlaceholder">
            <h1>Loading</h1>
            <p>Just starting...</p>
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