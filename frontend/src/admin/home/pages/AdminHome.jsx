import { Outlet } from "react-router-dom"
import { useState } from "react";
import OrgGate from "../../../common/components/OrgGate";
import AdminGate from "../../../common/components/AdminGate";
import { orgGateApi } from "../../../api/orgGate";

const AdminHome = () => {
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
  return (
    <div className="adminHome">
      <Outlet />
    </div>
    
  )
}

export default AdminHome