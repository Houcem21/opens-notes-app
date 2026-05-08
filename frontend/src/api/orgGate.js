import { orgSessionApi } from "./orgSession";
import { postsGateway } from "./postsGateway";
import { notesGateway } from "./notesGateway";
import { tasksGateway } from "./tasksGateway";

export const orgGateApi = {
  ...orgSessionApi,
  ...postsGateway,
  ...notesGateway,
  ...tasksGateway,
};