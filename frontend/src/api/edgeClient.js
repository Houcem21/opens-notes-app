const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;

export async function callFunction(path, body) {
  if (!FUNCTIONS_BASE) {
    throw new Error("Missing VITE_SUPABASE_FUNCTIONS_URL.");
  }

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