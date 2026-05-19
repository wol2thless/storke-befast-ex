export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { pid, ratings, additional_comment, prevention_comment } = body || {};
  if (!pid || !ratings) return { success: false, message: "Missing required fields" };

  const db = getDb();
  await db.execute(
    "INSERT INTO stk_satisfaction_survey (pid, ratings, additional_comment, prevention_comment) VALUES (?, ?, ?, ?)",
    [pid, typeof ratings === "string" ? ratings : JSON.stringify(ratings), additional_comment || "", prevention_comment || ""]
  );
  return { success: true, message: "Saved" };
});
