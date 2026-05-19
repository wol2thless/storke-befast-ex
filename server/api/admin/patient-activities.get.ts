import type { RowDataPacket } from "mysql2";

const VIDEO_TITLE_MAP: Record<number, string> = {
  1: "สัญญาณเตือน BEFAST",
  2: "การป้องกันกลับเป็นซ้ำ",
  100: "วิดีโอออกกำลังกาย 1",
  101: "วิดีโอออกกำลังกาย 2",
  102: "วิดีโอออกกำลังกาย 3",
  103: "วิดีโอออกกำลังกาย 4",
  104: "วิดีโอออกกำลังกาย 5",
  105: "วิดีโอออกกำลังกาย 6",
  106: "วิดีโอออกกำลังกาย 7",
  200: "โภชนาการ 1",
  201: "โภชนาการ 2",
  300: "การใช้ยา",
  400: "แรงจูงใจ 1",
  401: "แรงจูงใจ 2",
  402: "แรงจูงใจ 3",
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const pid = String(query.pid || "");
  if (!pid) return { success: false, message: "Missing pid" };

  const db = getDb();

  const [[personinfo]] = await db.execute<RowDataPacket[]>(
    "SELECT * FROM stk_personinfo WHERE pid = ? LIMIT 1",
    [pid]
  );
  const [befast] = await db.execute<RowDataPacket[]>(
    "SELECT * FROM stk_health_record_befast WHERE pid = ? ORDER BY record_date DESC LIMIT 10",
    [pid]
  );
  const [adl] = await db.execute<RowDataPacket[]>(
    "SELECT * FROM stk_adl_assessments WHERE pid = ? ORDER BY created_at DESC LIMIT 10",
    [pid]
  );
  const [exercise] = await db.execute<RowDataPacket[]>(
    "SELECT * FROM stk_exercise_records WHERE pid = ? ORDER BY created_at DESC LIMIT 10",
    [pid]
  );
  const [nutrition] = await db.execute<RowDataPacket[]>(
    "SELECT * FROM stk_nutrition_records WHERE pid = ? ORDER BY created_at DESC LIMIT 10",
    [pid]
  );
  const [medication] = await db.execute<RowDataPacket[]>(
    "SELECT * FROM stk_medication_records WHERE pid = ? ORDER BY created_at DESC LIMIT 10",
    [pid]
  );
  const [behavior] = await db.execute<RowDataPacket[]>(
    "SELECT * FROM stk_health_behavior WHERE pid = ? ORDER BY created_at DESC LIMIT 10",
    [pid]
  );
  const [survey] = await db.execute<RowDataPacket[]>(
    "SELECT * FROM stk_satisfaction_survey WHERE pid = ? ORDER BY created_at DESC LIMIT 10",
    [pid]
  );
  const [rawVideoStats] = await db.execute<RowDataPacket[]>(
    "SELECT video_id, COUNT(*) as view_count FROM stk_video_view_log WHERE pid = ? GROUP BY video_id ORDER BY view_count DESC",
    [pid]
  );

  const videoStats = (rawVideoStats as RowDataPacket[]).map((row) => ({
    video_id: row.video_id,
    video_title: VIDEO_TITLE_MAP[row.video_id as number] || `วิดีโอ ${row.video_id}`,
    view_count: row.view_count,
  }));

  return {
    success: true,
    data: { personinfo: personinfo || null, befast, adl, exercise, nutrition, medication, behavior, survey, videoStats },
  };
});
