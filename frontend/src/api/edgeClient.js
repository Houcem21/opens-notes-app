import { orgSessionApi } from "./sessionGateway";

const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;

function getFunctionUrl(path) {
  if (!FUNCTIONS_BASE) {
    throw new Error("Missing VITE_SUPABASE_FUNCTIONS_URL.");
  }

  return `${FUNCTIONS_BASE}/${path}`;
}

function handleSessionError(message) {
  const normalizedMessage = String(message || "").toLowerCase();

  if (normalizedMessage.includes("admin session expired")) {
    orgSessionApi.clearAdminSession();
    window.location.reload();
    return true;
  }

  if (normalizedMessage.includes("org session expired")) {
    orgSessionApi.clearOrgSession();
    window.location.href = "/";
    return true;
  }

  return false;
}

async function parseJsonResponse(response) {
  return response.json().catch(() => null);
}

async function handleResponse(response) {
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const message = data?.error || `${response.status} ${response.statusText}`;

    if (handleSessionError(message)) {
      return null;
    }

    throw new Error(message);
  }

  return data;
}

export async function callFunction(path, body) {
  const response = await fetch(getFunctionUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse(response);
}

export async function callMultipartFunction(path, formData) {
  const response = await fetch(getFunctionUrl(path), {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
}