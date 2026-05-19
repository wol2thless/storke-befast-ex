import type { RowDataPacket } from "mysql2";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const [rows] = await db.execute<RowDataPacket[]>(
    "SELECT id, provider_id, name, role, is_active, created_at FROM stk_admin_users ORDER BY created_at DESC"
  );
  return { success: true, data: rows };
});
