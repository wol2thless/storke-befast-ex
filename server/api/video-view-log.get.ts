import type { RowDataPacket } from "mysql2";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const pid = String(query.pid || "");
  const video_id = query.video_id ? Number(query.video_id) : null;

  const db = getDb();
  let sql = "SELECT * FROM stk_video_view_log WHERE 1=1";
  const params: (string | number)[] = [];
  if (pid) { sql += " AND pid = ?"; params.push(pid); }
  if (video_id) { sql += " AND video_id = ?"; params.push(video_id); }
  sql += " ORDER BY viewed_at DESC";

  const [rows] = await db.execute<RowDataPacket[]>(sql, params);
  return { success: true, data: rows };
});
