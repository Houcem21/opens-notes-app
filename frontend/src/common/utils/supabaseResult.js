export function requireData(result) {
  if (result.error) throw result.error;
  return result.data;
}

export function requireOk(result) {
  if (result.error) throw result.error;
  return { ok: true };
}