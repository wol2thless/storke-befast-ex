export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { pid, status, note } = body || {};
  if (!pid || !status) return { success: false, message: "Missing required fields" };

  const db = getDb();
  await db.execute(
    "INSERT INTO stk_nutrition_records (pid, status, note) VALUES (?, ?, ?)",
    [pid, status, note || ""]
  );
  return { success: true, message: "Saved" };
});
