import type { RowDataPacket } from "mysql2";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const pid = String(query.pid || "");
  if (!pid) return { success: false, message: "Missing pid" };

  const db = getDb();
  const [assessments] = await db.execute<RowDataPacket[]>(
    "SELECT a.*, GROUP_CONCAT(CONCAT(ans.question_key, ':', ans.answer_value) ORDER BY ans.question_key SEPARATOR ',') as answers_str FROM stk_adl_assessments a LEFT JOIN stk_adl_answers ans ON ans.assessment_id = a.id WHERE a.pid = ? GROUP BY a.id ORDER BY a.created_at DESC",
    [pid]
  );

  const data: Record<string, unknown> = {};
  for (const row of assessments as RowDataPacket[]) {
    const answers: Record<string, number> = {};
    if (row.answers_str) {
      for (const part of String(row.answers_str).split(",")) {
        const [k, v] = part.split(":");
        if (k) answers[k] = Number(v);
      }
    }
    data[String(row.id)] = { ...row, answers };
  }

  return { success: true, assessments: data };
});
