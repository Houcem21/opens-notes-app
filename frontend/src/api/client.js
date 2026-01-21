// frontend/src/api/client.js
export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "http://localhost:8080"; // local fallback

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
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
    throw new Error(msg);
  }

  return data;
}
