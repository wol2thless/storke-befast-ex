import type { RowDataPacket } from "mysql2";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const pid = String(query.pid || "");
  if (!pid) return { success: false, message: "Missing pid" };

  const db = getDb();
  const [rows] = await db.execute<RowDataPacket[]>(
    "SELECT * FROM stk_medication_records WHERE pid = ? ORDER BY created_at DESC",
    [pid]
  );
  return { success: true, data: rows };
});
