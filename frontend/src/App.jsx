// Tools
import { Link, Route, Routes } from "react-router-dom";

// Pages
import BlogPage from "./features/blog/pages/BlogPage";
import BlogCms from "./admin/pages/BlogCms";
import NotesPage from "./features/notes/pages/NotesPage";
import Home from "./features/home/pages/Home";

// Some styling
import "./App.css";

export default function App() {
  return (
    <div className="appShell">
      <nav className="appNav">
        <Link to="/">Home</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/notes">Notes</Link>
        <Link to="/admin/blog">CMS Admin</Link>
      </nav>

      <main className="appMain">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/admin/blog" element={<BlogCms />} />
        </Routes>
      </main>
    </div>
  );
}
