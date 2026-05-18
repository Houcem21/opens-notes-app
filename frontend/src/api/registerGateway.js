import { callFunction } from "./edgeClient";

export const registerGateway = {
  createOrganization({ organizationName }) {
    return callFunction("create-organization", {
      organizationName,
    });
  },
};