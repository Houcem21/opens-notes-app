import { callFunction } from "./edgeClient";

export const registerGateway = {
  requestOrgRegistration({ email, organizationName }) {
    return callFunction("request-org-registration", {
      email,
      organizationName,
    });
  },

  confirmOrgRegistration(token) {
    return callFunction("confirm-org-registration", {
      token,
    });
  },
};