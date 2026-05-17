import { callFunction } from "./edgeClient";
import { requireAdminToken, requireOrgToken } from "./authTokens";

export const tasksGateway = {
  getOrgTasks() {
    return callFunction("get-org-tasks", {
      orgToken: requireOrgToken(),
    });
  },

  async saveAdminTask(task) {
    const data = await callFunction("save-admin-task", {
      adminToken: requireAdminToken(),
      task,
    });

    return data.task;
  },

  deleteAdminTask(taskId) {
    return callFunction("delete-admin-task", {
      adminToken: requireAdminToken(),
      taskId,
    });
  },
};