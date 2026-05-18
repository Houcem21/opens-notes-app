// Tools
import { Routes, Route, useLocation } from "react-router-dom";

// Header
import Header from "./common/components/navigation/Header";

// Admin Pages
import AdminHome from "./admin/home/pages/AdminHome"
import NotesAdmin from "./admin/notes/pages/NotesAdmin"
import BlogCms from "./admin/blog/pages/BlogCms"
import TasksAdmin from "./admin/tasks/pages/TasksAdmin";
import ImportGithubRepo from "./admin/notes/pages/ImportGithubRepo";

// Feature Pages
import Home from "./features/home/pages/Home"
import NotesPage from "./features/notes/pages/NotesPage"
import BlogPage from "./features/blog/pages/BlogPage"
import TasksPage from "./features/tasks/pages/TasksPage"
import RegisterPage from "./features/register/pages/RegisterPage";

// Links
import {getNavigationLinks} from "./common/navigation/getNavigationLinks";
import { useSession } from "./common/session/useSession";

// Guards
import AdminRouteGuard from "./common/routing/AdminRouteGuard";
import OrgRouteGuard from "./common/routing/OrgRouteGuard";

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const { hasActiveOrg, hasAdminToken } = useSession();

  const links = getNavigationLinks({
    isAdmin,
    hasActiveOrg,
    hasAdminToken
  });

  return (
    <div className="appShell">
      <Header links={links} />
        <main className="appMain">
            <Routes>
              <Route index element={<Home />} />
              <Route path="/register" element={<RegisterPage />} />              
              <Route path="/blog" element={<OrgRouteGuard>
                  <BlogPage />
                </OrgRouteGuard>} 
              />
              <Route path="/notes" element={
                <OrgRouteGuard>
                  <NotesPage />
                </OrgRouteGuard>
                } 
              />
              <Route path="/tasks" element={
                <OrgRouteGuard>
                  <TasksPage />
                </OrgRouteGuard>
                }
              />
              <Route path="/admin" element={
                <AdminRouteGuard>
                  <AdminHome />
                </AdminRouteGuard>
                }>
                <Route path="notes" element={<NotesAdmin />} />
                <Route path="notes/import" element={<ImportGithubRepo />} />
                <Route path="blog" element={<BlogCms />} />
                <Route path="tasks" element={<TasksAdmin />} />
                
              </Route>
            </Routes>
        </main>
    </div>
  );
}
