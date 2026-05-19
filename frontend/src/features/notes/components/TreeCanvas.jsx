import { useState } from "react";
import { orgGateApi } from "../../../api";
import TreeCanvasBase from "../../../common/notes/components/TreeCanvasBase";

export default function TreeCanvas() {

  return (
    <TreeCanvasBase
      readOnly
      loadNotes={() => orgGateApi.getOrgNotes()}
    />
  );
}