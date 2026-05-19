export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { pid, video_id } = body || {};
  if (!pid || !video_id) return { success: false, message: "Missing required fields" };

  const db = getDb();
  await db.execute(
    "INSERT INTO stk_video_view_log (pid, video_id, viewed_at) VALUES (?, ?, NOW())",
    [pid, Number(video_id)]
  );
  return { success: true, message: "Logged" };
});
