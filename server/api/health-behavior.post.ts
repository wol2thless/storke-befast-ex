export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { pid, behaviors, note } = body || {};
  if (!pid || !behaviors) return { success: false, message: "Missing required fields" };

  const db = getDb();
  await db.execute(
    "INSERT INTO stk_health_behavior (pid, behaviors, note) VALUES (?, ?, ?)",
    [pid, behaviors, note || ""]
  );
  return { success: true, message: "Saved" };
});
