export default function PostQueueSidebar({
  posts,
  selectedPostId,
  onSelectPost,
  onCreatePost,
  onLogout,
}) {
  return (
    <>
      <div className="postQueueHeader">
        <h2>Posts</h2>
        <button className="btn" onClick={onCreatePost}>
          New
        </button>
      </div>

      <div className="postQueueList">
        {posts.map((post) => (
          <button
            key={post.id}
            className={`postQueueItem ${
              post.id === selectedPostId ? "active" : ""
            }`}
            onClick={() => onSelectPost(post)}
          >
            <strong>{post.title}</strong>
            <span>{post.status}</span>
          </button>
        ))}
      </div>

      <button className="btn btnSecondary logoutBtn" onClick={onLogout}>
        Logout
      </button>
    </>
  );
}