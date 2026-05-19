import type { RowDataPacket, ExecuteValues } from "mysql2";

async function count(db: ReturnType<typeof getDb>, sql: string, params?: ExecuteValues): Promise<number> {
  const [[row]] = await db.execute<RowDataPacket[]>(sql, params);
  return Number((row as RowDataPacket | undefined)?.total) || 0;
}

async function countWithPeople(db: ReturnType<typeof getDb>, table: string, dateCol: string, month: string | null) {
  if (month) {
    const [[row]] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as records, COUNT(DISTINCT pid) as people FROM ${table} WHERE DATE_FORMAT(${dateCol}, '%Y-%m') = ?`,
      [month]
    );
    return { records: Number((row as RowDataPacket)?.records) || 0, people: Number((row as RowDataPacket)?.people) || 0 };
  }
  const [[row]] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as records, COUNT(DISTINCT pid) as people FROM ${table}`
  );
  return { records: Number((row as RowDataPacket)?.records) || 0, people: Number((row as RowDataPacket)?.people) || 0 };
}

function getLast12Months(): string[] {
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

async function monthlyData(db: ReturnType<typeof getDb>, table: string, dateCol: string): Promise<{ month: string; count: number }[]> {
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT DATE_FORMAT(${dateCol}, '%Y-%m') as month, COUNT(*) as count
     FROM ${table}
     WHERE ${dateCol} >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
     GROUP BY month ORDER BY month ASC`
  );
  const map = new Map((rows as RowDataPacket[]).map(r => [String(r.month), Number(r.count)]));
  return getLast12Months().map(m => ({ month: m, count: map.get(m) || 0 }));
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const month = query.month ? String(query.month) : null;
  const db = getDb();

  // Total patients
  const patients = await count(db, "SELECT COUNT(*) as total FROM stk_personinfo");

  // New patients this month
  const newPatients = month
    ? await count(db, "SELECT COUNT(*) as total FROM stk_personinfo WHERE DATE_FORMAT(created_at, '%Y-%m') = ?", [month])
    : await count(db, "SELECT COUNT(*) as total FROM stk_personinfo WHERE YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())");

  // Simple month counts
  const befast    = month ? await count(db, "SELECT COUNT(*) as total FROM stk_health_record_befast WHERE DATE_FORMAT(record_date, '%Y-%m') = ?", [month]) : await count(db, "SELECT COUNT(*) as total FROM stk_health_record_befast");
  const adl       = month ? await count(db, "SELECT COUNT(*) as total FROM stk_adl_assessments WHERE DATE_FORMAT(created_at, '%Y-%m') = ?", [month]) : await count(db, "SELECT COUNT(*) as total FROM stk_adl_assessments");
  const videoViews= month ? await count(db, "SELECT COUNT(*) as total FROM stk_video_view_log WHERE DATE_FORMAT(viewed_at, '%Y-%m') = ?", [month]) : await count(db, "SELECT COUNT(*) as total FROM stk_video_view_log");
  const surveys   = month ? await count(db, "SELECT COUNT(*) as total FROM stk_satisfaction_survey WHERE DATE_FORMAT(created_at, '%Y-%m') = ?", [month]) : await count(db, "SELECT COUNT(*) as total FROM stk_satisfaction_survey");

  // Records + people
  const exerciseMonth  = await countWithPeople(db, "stk_exercise_records", "created_at", month);
  const nutritionMonth = await countWithPeople(db, "stk_nutrition_records", "created_at", month);
  const medicationMonth= await countWithPeople(db, "stk_medication_records", "created_at", month);
  const behaviorMonth  = await countWithPeople(db, "stk_health_behavior", "created_at", month);
  const satisfactionMonth = await countWithPeople(db, "stk_satisfaction_survey", "created_at", month);

  // BEFAST severity distribution
  const befastSql = month
    ? "SELECT CASE WHEN symptoms = 'NONE' OR symptoms IS NULL OR symptoms = '' THEN 'ไม่มีความเสี่ยง' ELSE 'มีความเสี่ยงสูง' END as severity_level, COUNT(*) as count, COUNT(DISTINCT pid) as unique_people FROM stk_health_record_befast WHERE DATE_FORMAT(record_date, '%Y-%m') = ? GROUP BY severity_level"
    : "SELECT CASE WHEN symptoms = 'NONE' OR symptoms IS NULL OR symptoms = '' THEN 'ไม่มีความเสี่ยง' ELSE 'มีความเสี่ยงสูง' END as severity_level, COUNT(*) as count, COUNT(DISTINCT pid) as unique_people FROM stk_health_record_befast GROUP BY severity_level";
  const [befastSeverityRows] = await db.execute<RowDataPacket[]>(befastSql, month ? [month] : []);

  // Gender distribution
  const [genderRows] = await db.execute<RowDataPacket[]>(
    "SELECT gender, COUNT(*) as count FROM stk_personinfo GROUP BY gender ORDER BY count DESC"
  );

  // Age distribution
  const [ageRows] = await db.execute<RowDataPacket[]>(
    `SELECT CASE
       WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) < 40 THEN 'ต่ำกว่า 40 ปี'
       WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) < 50 THEN '40-49 ปี'
       WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) < 60 THEN '50-59 ปี'
       WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) < 70 THEN '60-69 ปี'
       WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) < 80 THEN '70-79 ปี'
       ELSE '80 ปีขึ้นไป'
     END as age_group, COUNT(*) as count
     FROM stk_personinfo WHERE birthdate IS NOT NULL
     GROUP BY age_group ORDER BY MIN(birthdate) ASC`
  );

  // Popular videos this month / all time
  const videoSql = month
    ? "SELECT video_id, COUNT(*) as view_count FROM stk_video_view_log WHERE DATE_FORMAT(viewed_at, '%Y-%m') = ? GROUP BY video_id ORDER BY view_count DESC LIMIT 10"
    : "SELECT video_id, COUNT(*) as view_count FROM stk_video_view_log GROUP BY video_id ORDER BY view_count DESC LIMIT 10";
  const [videoRows] = await db.execute<RowDataPacket[]>(videoSql, month ? [month] : []);

  const VIDEO_TITLE_MAP: Record<number, string> = {
    1: "สัญญาณเตือน BEFAST", 2: "การป้องกันกลับเป็นซ้ำ",
    100: "กายภาพบำบัด 1", 101: "กายภาพบำบัด 2", 102: "กายภาพบำบัด 3",
    103: "กายภาพบำบัด 4", 104: "ออกกำลังกายที่บ้าน", 105: "ฝึกพูด",
    200: "โภชนาการ 1", 201: "อาหารที่ควรหลีกเลี่ยง",
    300: "ความรู้เรื่องยา",
    400: "เสริมพลังใจ 1", 401: "กำลังใจและแรงบันดาลใจ", 402: "พลังใจในการฟื้นฟู",
  };

  const popularVideos = (videoRows as RowDataPacket[]).map(r => ({
    video_id: r.video_id,
    video_title: VIDEO_TITLE_MAP[Number(r.video_id)] || `วิดีโอ ${r.video_id}`,
    view_count: Number(r.view_count),
  }));

  // Monthly comparison (last 12 months)
  const [befastMonthly, adlMonthly, exerciseMonthly, nutritionMonthly, medicationMonthly, behaviorMonthly, surveyMonthly] = await Promise.all([
    monthlyData(db, "stk_health_record_befast", "record_date"),
    monthlyData(db, "stk_adl_assessments", "created_at"),
    monthlyData(db, "stk_exercise_records", "created_at"),
    monthlyData(db, "stk_nutrition_records", "created_at"),
    monthlyData(db, "stk_medication_records", "created_at"),
    monthlyData(db, "stk_health_behavior", "created_at"),
    monthlyData(db, "stk_satisfaction_survey", "created_at"),
  ]);
  // video views monthly
  const [videoViewRows] = await db.execute<RowDataPacket[]>(
    "SELECT DATE_FORMAT(viewed_at, '%Y-%m') as month, COUNT(*) as count FROM stk_video_view_log WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY month ORDER BY month ASC"
  );
  const videoMap = new Map((videoViewRows as RowDataPacket[]).map(r => [String(r.month), Number(r.count)]));
  const videoMonthly = getLast12Months().map(m => ({ month: m, count: videoMap.get(m) || 0 }));

  return {
    success: true,
    data: {
      patients,
      new_patients_this_month: newPatients,
      befast, adl,
      exercise: exerciseMonth.records, nutrition: nutritionMonth.records,
      medication: medicationMonth.records, behavior: behaviorMonth.records,
      videoViews, surveys,
      exercise_month: exerciseMonth,
      nutrition_month: nutritionMonth,
      medication_month: medicationMonth,
      behavior_month: behaviorMonth,
      satisfaction_month: satisfactionMonth,
      befast_severity_distribution: befastSeverityRows,
      gender_distribution: genderRows,
      age_distribution: ageRows,
      popular_videos: popularVideos,
      monthly_comparison: {
        befast_assessments: befastMonthly,
        adl_assessments: adlMonthly,
        exercise_records: exerciseMonthly,
        nutrition_records: nutritionMonthly,
        medication_records: medicationMonthly,
        health_behavior: behaviorMonthly,
        satisfaction_survey: surveyMonthly,
        video_views: videoMonthly,
      },
    },
  };
});
