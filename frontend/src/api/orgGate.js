import { orgSessionApi } from "./orgSession";
import { postsGateway } from "./postsGateway";
import { notesGateway } from "./notesGateway";
import { tasksGateway } from "./tasksGateway";
import { storageGateway } from "./storageGateway";

export const orgGateApi = {
  ...orgSessionApi,
  ...postsGateway,
  ...notesGateway,
  ...tasksGateway,
  ...storageGateway,
};