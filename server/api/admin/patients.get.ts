import type { RowDataPacket } from "mysql2";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const search = query.search ? `%${String(query.search)}%` : null;
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Number(query.limit) || 20);
  const offset = (page - 1) * limit;

  const db = getDb();
  let sql = "SELECT * FROM stk_personinfo WHERE 1=1";
  const params: (string | number)[] = [];
  if (search) { sql += " AND (name_th LIKE ? OR pid LIKE ?)"; params.push(search, search); }
  sql += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

  const [rows] = await db.execute<RowDataPacket[]>(sql, params);

  let countSql = "SELECT COUNT(*) as total FROM stk_personinfo WHERE 1=1";
  const countParams: string[] = [];
  if (search) { countSql += " AND (name_th LIKE ? OR pid LIKE ?)"; countParams.push(search as string, search as string); }
  const [[countRow]] = await db.execute<RowDataPacket[]>(countSql, countParams);

  return { success: true, data: rows, total: countRow?.total || 0, page, limit };
});
