import { useMemo, useState } from "react";
import { orgSessionApi } from "../../api/sessionGateway";
import { SessionContext } from "./SessionContext";
import { ApiSessionError } from "../../api/ApiSessionError";

export default function SessionProvider({ children }) {
  const [activeOrg, setActiveOrgState] = useState(orgSessionApi.getActiveOrg());
  const [adminToken, setAdminTokenState] = useState(orgSessionApi.getAdminToken());

  function activateOrg(organization) {
    setActiveOrgState(organization);
  }

  function activateAdmin(token) {
    setAdminTokenState(token);
  }

  function clearAdmin() {
    orgSessionApi.clearAdminSession();
    setAdminTokenState(null);
  }

  function clearOrg() {
    orgSessionApi.clearOrgSession();
    setActiveOrgState(null);
    setAdminTokenState(null);
  }

  function handleApiError(error) {
    if (!(error instanceof ApiSessionError)) {
      return false;
    }

    if (error.sessionType === "admin") {
      clearAdmin();
      return true;
    }

    if (error.sessionType === "org") {
      clearOrg();
      return true;
    }

    return false;
  }

  const session = useMemo(
    () => ({
      activeOrg,
      adminToken,
      hasActiveOrg: Boolean(activeOrg),
      hasAdminToken: Boolean(adminToken),
      activateOrg,
      activateAdmin,
      clearAdmin,
      clearOrg,
      handleApiError
    }),
    [activeOrg, adminToken]
  );

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}