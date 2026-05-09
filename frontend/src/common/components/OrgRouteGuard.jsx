import { useState } from "react";

import OrgGate from "./OrgGate";
import { orgGateApi } from "../../api";

export default function OrgRouteGuard({ children }) {
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

  return children;
}