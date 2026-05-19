export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { pid, status, meal_times, meals, note } = body || {};
  if (!pid || !status) return { success: false, message: "Missing required fields" };

  const db = getDb();
  await db.execute(
    "INSERT INTO stk_medication_records (pid, status, meal_times, meals, note) VALUES (?, ?, ?, ?, ?)",
    [pid, status, meal_times || "", typeof meals === "string" ? meals : JSON.stringify(meals || {}), note || ""]
  );
  return { success: true, message: "Saved" };
});
