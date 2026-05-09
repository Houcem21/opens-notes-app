import { Link, Outlet, useLocation } from "react-router-dom";

import { orgGateApi } from "../../../api";
export default function AdminHome() {
  const location = useLocation();
  const isAdminIndex = location.pathname === "/admin";


  if (!isAdminIndex) {
    return (
      <div className="adminHome">
        <Outlet />
      </div>
    );
  }

  return (
    <main className="adminLanding">
      <h1>Admin Space</h1>
      <p className="mutedText">Choose an admin tool.</p>

      <div className="adminLandingGrid">
        <Link className="adminLandingCard" to="/admin/blog">
          <strong>Blog CMS</strong>
          <span>Manage documentation posts.</span>
        </Link>

        <Link className="adminLandingCard" to="/admin/notes">
          <strong>Notes Admin</strong>
          <span>Edit organization knowledge trees.</span>
        </Link>

        <Link className="adminLandingCard" to="/admin/tasks">
          <strong>Tasks Admin</strong>
          <span>Manage organization tasks.</span>
        </Link>
      </div>

      <button
        className="btn btnSecondary logoutBtn"
        onClick={() => orgGateApi.logoutAdmin()}
      >
        Logout
      </button>
    </main>
  );
}