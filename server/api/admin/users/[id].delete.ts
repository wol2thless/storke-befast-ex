export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) return { success: false, message: "Missing id" };

  const db = getDb();
  await db.execute("UPDATE stk_admin_users SET is_active = 0 WHERE id = ?", [id]);
  return { success: true, message: "Deactivated" };
});
