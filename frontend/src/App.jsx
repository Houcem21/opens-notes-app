// Tools
import { Routes, Route, useLocation } from "react-router-dom";

// Header
import Header from "./common/components/navigation/Header";

// Admin Pages
import AdminHome from "./admin/home/pages/AdminHome"
import NotesAdmin from "./admin/notes/pages/NotesAdmin"
import BlogCms from "./admin/blog/pages/BlogCms"
import TasksAdmin from "./admin/tasks/pages/TasksAdmin";

// Feature Pages
import Home from "./features/home/pages/Home"
import NotesPage from "./features/notes/pages/NotesPage"
import BlogPage from "./features/blog/pages/BlogPage"
import TasksPage from "./features/tasks/pages/TasksPage"

// Links
import { navList, adminNavList } from "./common/constants/linkDefaults";


export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="appShell">
      <Header links={isAdmin ? adminNavList : navList} />
        <main className="appMain">
            <Routes>
              <Route index element={<Home />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/tasks" element={<TasksPage />} />

              <Route path="/admin" element={<AdminHome />}>
                <Route path="notes" element={<NotesAdmin />} />
                <Route path="blog" element={<BlogCms />} />
                <Route path="tasks" element={<TasksAdmin />} />
              </Route>
            </Routes>
        </main>
    </div>
  );
}
