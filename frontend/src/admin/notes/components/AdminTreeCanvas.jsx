import { useState } from "react";
import OrgGate from "../../../common/components/OrgGate";
import AdminGate from "../../../common/components/AdminGate";
import { orgGateApi } from "../../../api/orgGate";
import TreeCanvasBase from "../../../features/notes/components/TreeCanvasBase";

export default function AdminTreeCanvas() {
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
    <TreeCanvasBase
      readOnly={false}
      loadNotes={() => orgGateApi.getOrgNotes()}
      onCreateNode={(node) => orgGateApi.saveAdminNode(node)}
      onUpdateNode={(node) => orgGateApi.saveAdminNode(node)}
      onDeleteNode={(nodeId) => orgGateApi.deleteAdminNode(nodeId)}
    />
  );
}