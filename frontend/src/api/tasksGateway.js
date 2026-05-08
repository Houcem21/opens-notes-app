import { callFunction } from "./edgeClient";
import { orgSessionApi } from "./sessionGateway";

export const tasksGateway = {
    async getOrgTasks() {
        const orgToken = orgSessionApi.getOrgToken();

        if (!orgToken) {
        throw new Error("Organization access required.");
        }

        return callFunction("get-org-tasks", { orgToken });
    },
    async saveAdminTask(task) {
        const adminToken = orgSessionApi.getAdminToken();

        if (!adminToken) {
            throw new Error("Admin access required.");
        }

        const data = await callFunction("save-admin-task", {
            adminToken,
            task,
        });

        return data.task;
    },

    async deleteAdminTask(taskId) {
        const adminToken = orgSessionApi.getAdminToken();

        if (!adminToken) {
            throw new Error("Admin access required.");
        }

        return callFunction("delete-admin-task", {
            adminToken,
            taskId,
        });
    },
};