import { orgSessionApi } from "./sessionGateway";

export function requireOrgToken() {
  const orgToken = orgSessionApi.getOrgToken();

  if (!orgToken) {
    throw new Error("Organization access required.");
  }

  return orgToken;
}

export function requireAdminToken() {
  const adminToken = orgSessionApi.getAdminToken();

  if (!adminToken) {
    throw new Error("Admin access required.");
  }

  return adminToken;
}