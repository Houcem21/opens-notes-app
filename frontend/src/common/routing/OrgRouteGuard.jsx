import { useState } from "react";

import OrgGate from "../auth/OrgGate";
import { useSession } from "../session/useSession";

export default function OrgRouteGuard({ children }) {
  const { activeOrg, activateOrg } = useSession();

  if (!activeOrg) {
    return (
      <OrgGate
        onSuccess={activateOrg}
      />
    );
  }

  return children;
}