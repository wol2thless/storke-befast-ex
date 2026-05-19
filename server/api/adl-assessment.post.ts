import type { ResultSetHeader } from "mysql2";

const QUESTIONS = ["eat","hygiene","dress","toilet","walk","dressing","stairs","bath","bowel_control","bladder_control"];

function calcResult(answers: Record<string, number>) {
  const total = QUESTIONS.reduce((s, k) => s + (Number(answers[k]) || 0), 0);
  const maxScore = QUESTIONS.length * 2;
  const percent = maxScore === 0 ? 0 : (total / maxScore) * 100;
  let level = "";
  let interpretation = "";
  if (percent >= 80) { level = "ช่วยเหลือตนเองได้ (Independent)"; interpretation = "ช่วยเหลือตนเองได้"; }
  else if (percent >= 60) { level = "พึ่งพาบางส่วน (Partially Dependent)"; interpretation = "พึ่งพาบางส่วน"; }
  else if (percent >= 40) { level = "พึ่งพามาก (Severely Dependent)"; interpretation = "พึ่งพามาก"; }
  else { level = "พึ่งพาโดยสมบูรณ์ (Total Dependent)"; interpretation = "พึ่งพาโดยสมบูรณ์"; }
  return { total, maxScore, percent, level, interpretation };
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { patient_id, answers } = body || {};
  if (!patient_id || !answers) return { success: false, message: "Missing required fields" };

  const { total, maxScore, percent, level, interpretation } = calcResult(answers);
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.execute<ResultSetHeader>(
      "INSERT INTO stk_adl_assessments (pid, total_score, max_score, percent, interpretation, dependency_level) VALUES (?, ?, ?, ?, ?, ?)",
      [patient_id, total, maxScore, percent.toFixed(2), interpretation, level]
    );
    const assessmentId = result.insertId;
    for (const key of QUESTIONS) {
      await conn.execute(
        "INSERT INTO stk_adl_answers (assessment_id, question_key, answer_value) VALUES (?, ?, ?)",
        [assessmentId, key, Number(answers[key]) || 0]
      );
    }
    await conn.commit();
    return { success: true, message: "Saved", total_score: total, max_score: maxScore, percent, dependency_level: level };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});
