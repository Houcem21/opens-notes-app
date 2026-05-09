import { useState } from "react";
import AdminGate from "./AdminGate";
import OrgGate from "./OrgGate";
import { orgGateApi } from "../../api";

export default function AdminRouteGuard({ children }) {
  const [activeOrg, setActiveOrg] = useState(orgGateApi.getActiveOrg());
  const [adminToken, setAdminToken] = useState(orgGateApi.getAdminToken());

  function resetAdminGate() {
    orgGateApi.clearAdminSession();
    setAdminToken(null);
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

  if (!adminToken) {
    return (
      <AdminGate
        onSuccess={() => {
          setAdminToken(orgGateApi.getAdminToken());
        }}
      />
    );
  }

  return (
    <AdminSessionBoundary onSessionExpired={resetAdminGate}>
      {children}
    </AdminSessionBoundary>
  );
}

function AdminSessionBoundary({ children, onSessionExpired }) {
  try {
    return children;
  } catch (err) {
    if (String(err.message || "").toLowerCase().includes("admin session expired")) {
      onSessionExpired();
      return null;
    }

    throw err;
  }
}