import { orgSessionApi } from "./sessionGateway";
import { postsGateway } from "./postsGateway";
import { notesGateway } from "./notesGateway";
import { tasksGateway } from "./tasksGateway";
import { storageGateway } from "./storageGateway";
import { registerGateway } from "./registerGateway";

export const orgGateApi = {
  ...orgSessionApi,
  ...postsGateway,
  ...notesGateway,
  ...tasksGateway,
  ...storageGateway,
  ...registerGateway
};