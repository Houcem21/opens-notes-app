export function timestampsFrom(row) {
  return {
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}