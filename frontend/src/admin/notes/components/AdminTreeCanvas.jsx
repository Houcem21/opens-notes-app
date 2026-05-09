import { useState } from "react";

import { orgGateApi } from "../../../api";

import TreeCanvasBase from "../../../features/notes/components/TreeCanvasBase";

export default function AdminTreeCanvas() {
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