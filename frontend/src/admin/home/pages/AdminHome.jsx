import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import AdminGate from "../../../common/components/AdminGate";
import OrgGate from "../../../common/components/OrgGate";
import { orgGateApi } from "../../../api/orgGate";


export default function AdminHome() {
  const location = useLocation();
  const isAdminIndex = location.pathname === "/admin";
  const [activeOrg, setActiveOrg] = useState(orgGateApi.getActiveOrg());
  const [adminToken, setAdminToken] = useState(orgGateApi.getAdminToken());


  if (!activeOrg) {
    return (
      <OrgGate
        onSuccess={(organization) => {
          setActiveOrg(organization);
        }}
      />
    );
  }

  if (!adminToken) {
    return (
      <AdminGate
        onSuccess={(token) => {
          setAdminToken(token);
        }}
      />
    );
  }



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
    </main>
  );
}