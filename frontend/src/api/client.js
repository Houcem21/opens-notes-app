export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:8080";

function getAdminAuthHeader() {
  const username = localStorage.getItem("adminUser");
  const password = localStorage.getItem("adminPassword");

  if (!username || !password) return {};

  return {
    Authorization: `Basic ${btoa(`${username}:${password}`)}`,
  };
}

export function saveAdminCredentials(username, password) {
  localStorage.setItem("adminUser", username);
  localStorage.setItem("adminPassword", password);
}

export function clearAdminCredentials() {
  localStorage.removeItem("adminUser");
  localStorage.removeItem("adminPassword");
}

export async function apiFetch(path, options = {}) {
  const isAdminRequest =
    path.includes("/admin") ||
    options.method === "POST" ||
    options.method === "PATCH" ||
    options.method === "DELETE";

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(isAdminRequest ? getAdminAuthHeader() : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = data?.error || `${res.status} ${res.statusText}`;
    const error = new Error(msg);
    error.status = res.status;
    throw error;
  }

  return data;
}