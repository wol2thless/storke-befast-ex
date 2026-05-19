import bcrypt from "bcryptjs";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const { name, role, password, is_active } = body || {};
  if (!id) return { success: false, message: "Missing id" };

  const db = getDb();
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    await db.execute("UPDATE stk_admin_users SET name=?, role=?, password=?, is_active=? WHERE id=?",
      [name, role, hash, is_active ?? 1, id]);
  } else {
    await db.execute("UPDATE stk_admin_users SET name=?, role=?, is_active=? WHERE id=?",
      [name, role, is_active ?? 1, id]);
  }
  return { success: true, message: "Updated" };
});
