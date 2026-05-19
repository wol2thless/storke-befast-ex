import type { RowDataPacket } from "mysql2";

interface PersonInfoRow extends RowDataPacket {
  pid: string;
  occupation: string;
  otherOccupation: string;
  education: string;
  phone: string;
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const pid = query.pid as string;

  if (!pid) {
    throw createError({ statusCode: 400, message: "Missing pid" });
  }

  const db = getDb();
  const [rows] = await db.execute<PersonInfoRow[]>(
    "SELECT pid, occupation, otherOccupation, education, phone FROM stk_personinfo WHERE pid = ?",
    [pid]
  );

  if (rows[0]) {
    return { success: true, data: rows[0] };
  }
  return { success: false, message: "Not found" };
});
