import { useState } from "react";
import OrgGate from "../../../common/components/OrgGate";
import { orgGateApi } from "../../../api/orgGate";
import TreeCanvasBase from "./TreeCanvasBase";

export default function TreeCanvas() {
  const [activeOrg, setActiveOrg] = useState(orgGateApi.getActiveOrg());

  if (!activeOrg) {
    return (
      <OrgGate
        onSuccess={(organization) => {
          setActiveOrg(organization);
        }}
      />
    );
  }

  return (
    <TreeCanvasBase
      readOnly
      loadNotes={() => orgGateApi.getOrgNotes()}
    />
  );
}