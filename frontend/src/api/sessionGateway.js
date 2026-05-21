import { callFunction } from "./edgeClient";

const ORG_TOKEN_KEY = "orgToken";
const ACTIVE_ORG_KEY = "activeOrg";
const ADMIN_TOKEN_KEY = "adminToken";

export const orgSessionApi = {
  getOrgToken() {
    return localStorage.getItem(ORG_TOKEN_KEY);
  },

  getActiveOrg() {
    const raw = localStorage.getItem(ACTIVE_ORG_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  saveOrgSession({ token, organization }) {
    localStorage.setItem(ORG_TOKEN_KEY, token);
    localStorage.setItem(ACTIVE_ORG_KEY, JSON.stringify(organization));
  },

  clearOrgSession() {
    localStorage.removeItem(ORG_TOKEN_KEY);
    localStorage.removeItem(ACTIVE_ORG_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },

  async enterOrg(code) {
    const data = await callFunction("enter-org", { code });
    this.saveOrgSession(data);
    return data;
  },

  getAdminToken() {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },

  saveAdminSession({ adminToken }) {
    localStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
  },

  clearAdminSession() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },

  async enterAdmin(adminCode) {
    const orgToken = this.getOrgToken();

    if (!orgToken) {
      throw new Error("Organization access required.");
    }

    const data = await callFunction("enter-admin", {
      orgToken,
      adminCode,
    });

    this.saveAdminSession(data);
    return data;
  },
};