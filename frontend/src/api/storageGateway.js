import { callMultipartFunction } from "./edgeClient";
import { orgSessionApi } from "./orgSession";

export const storageGateway = {
  async uploadAdminImage(file) {
    const adminToken = orgSessionApi.getAdminToken();

    if (!adminToken) {
      throw new Error("Admin access required.");
    }

    const formData = new FormData();
    formData.append("adminToken", adminToken);
    formData.append("file", file, file.name);

    return callMultipartFunction("upload-admin-image", formData);
  },
};