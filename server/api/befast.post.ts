export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { pid, symptoms, note } = body || {};
  if (!pid || !symptoms) return { success: false, message: "Missing required fields" };

  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  await db.execute(
    "INSERT INTO stk_health_record_befast (pid, symptoms, note, record_date) VALUES (?, ?, ?, ?)",
    [pid, symptoms, note || "", today]
  );
  return { success: true, message: "Saved" };
});
