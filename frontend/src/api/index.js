import { orgSessionApi } from "./sessionGateway";
import { postsGateway } from "./postsGateway";
import { graphGateway } from "./graphGateway";
import { tasksGateway } from "./tasksGateway";
import { storageGateway } from "./storageGateway";
import { registerGateway } from "./registerGateway";

export const orgGateApi = {
  ...orgSessionApi,
  ...postsGateway,
  ...graphGateway,
  ...tasksGateway,
  ...storageGateway,
  ...registerGateway
};