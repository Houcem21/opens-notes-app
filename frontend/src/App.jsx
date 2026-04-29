// Tools
import { Link, Route, Routes } from "react-router-dom";

// Pages
import BlogPage from "./features/blog/pages/BlogPage";
import BlogCms from "./admin/pages/BlogCms";
import NotesPage from "./features/notes/pages/NotesPage";
import Home from "./features/home/pages/Home";
import TasksPage from "./features/tasks/pages/TasksPage"

// Header
import Header from "./common/components/navigation/Header";

// Some styling
import "./App.css";

export default function App() {
  return (
    <div className="appShell">
      <Header />
      <main className="appMain">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/admin/blog" element={<BlogCms />} />
        </Routes>
      </main>
    </div>
  );
}
