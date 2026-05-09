import { useState } from "react";
import { orgGateApi } from "../../../api";
import TreeCanvasBase from "./TreeCanvasBase";

export default function TreeCanvas() {

  return (
    <TreeCanvasBase
      readOnly
      loadNotes={() => orgGateApi.getOrgNotes()}
    />
  );
}