import AdminGate from "../auth/AdminGate";
import OrgGate from "../auth/OrgGate";
import { useSession } from "../session/useSession";
import { orgGateApi } from "../../api";

export default function AdminRouteGuard({ children }) {
  const { activeOrg, adminToken, activateOrg, activateAdmin } = useSession();

if (!activeOrg) {
  return <OrgGate onSuccess={activateOrg} />;
}

if (!adminToken) {
  return <AdminGate onSuccess={() => activateAdmin(orgGateApi.getAdminToken())} />;
}

return children;

}