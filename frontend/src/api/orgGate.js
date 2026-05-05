const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;

const ORG_TOKEN_KEY = "orgToken";
const ACTIVE_ORG_KEY = "activeOrg";

async function callFunction(path, body) {
  const res = await fetch(`${FUNCTIONS_BASE}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `${res.status} ${res.statusText}`);
  }

  return data;
}

export const orgGateApi = {
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
  },

  async enterOrg(code) {
    const data = await callFunction("enter-org", { code });
    this.saveOrgSession(data);
    return data;
  },

  async getOrgPosts() {
    const orgToken = this.getOrgToken();

    if (!orgToken) {
      throw new Error("Organization access required.");
    }

    const data = await callFunction("get-org-posts", { orgToken });
    return data.posts || [];
  },

  getAdminToken() {
    return localStorage.getItem("adminToken");
  },

  saveAdminSession({ adminToken }) {
    localStorage.setItem("adminToken", adminToken);
  },

  clearAdminSession() {
    localStorage.removeItem("adminToken");
  },

  async enterAdmin(adminCode) {
    this.clearAdminSession();

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
  async getAdminPosts() {
    const adminToken = this.getAdminToken();

    if (!adminToken) {
      throw new Error("Admin access required.");
    }

    const data = await callFunction("get-admin-posts", { adminToken });
    return data.posts || [];
  },
  
  async saveAdminPost(post) {
    const adminToken = this.getAdminToken();

    if (!adminToken) {
      throw new Error("Admin access required.");
    }

    const data = await callFunction("save-admin-post", {
      adminToken,
      post,
    });

    return data.post;
  },

  async deleteAdminPost(postId) {
    const adminToken = this.getAdminToken();

    if (!adminToken) {
      throw new Error("Admin access required.");
    }

    return callFunction("delete-admin-post", {
      adminToken,
      postId,
    });
  },

  
// Notes

  async getOrgNotes() {
  const orgToken = this.getOrgToken();

  if (!orgToken) {
    throw new Error("Organization access required.");
  }

  return callFunction("get-org-notes", { orgToken });
},
};