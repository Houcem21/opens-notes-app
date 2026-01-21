// src/api/config.js
export async function loadConfig() {
  const res = await fetch("/config.json", { cache: "no-store" });
  if (!res.ok) {
    // fallback to localhost for dev convenience
    return { API_BASE: "http://localhost:8080" };
  }
  return res.json();
}
