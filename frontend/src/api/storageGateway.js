import { callMultipartFunction } from "./edgeClient";
import { requireAdminToken } from "./authTokens";

export const storageGateway = {
  uploadAdminImage(file) {
    const formData = new FormData();

    formData.append("adminToken", requireAdminToken());
    formData.append("file", file, file.name);

    return callMultipartFunction("upload-admin-image", formData);
  },
};