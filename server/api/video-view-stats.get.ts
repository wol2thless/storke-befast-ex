import type { RowDataPacket } from "mysql2";

const VIDEO_TITLE_MAP: Record<number, string> = {
  1: "1. สัญญาณเตือนอาการโรคหลอดเลือดสมอง (BEFAST)",
  2: "2. การป้องกันโรคหลอดเลือดสมองกลับมาเป็นซ้ำ",
  100: "กายภาพบำบัด สำหรับผู้ป่วยโรคหลอดเลือดสมอง : [ชุดความรู้ STROKE-05]",
  101: "การออกกำลังกายด้วยตัวเองในผู้ป่วยโรคหลอดเลือดสมอง | งานกายภาพบำบัด โรงพยาบาลราชวิถี",
  102: "การจัดท่านอนหงายและการพลิกตะแคงตัวในผู้ป่วยโรคหลอดเลือดสมอง | งานกายภาพบำบัด โรงพยาบาลราชวิถี",
  103: "การเคลื่อนไหวข้อต่อโดยญาติ/ผู้ดูแลในผู้ป่วยโรคหลอดเลือดสมอง | งานกายภาพบำบัด โรงพยาบาลราชวิถี",
  104: "การออกกำลังกาย สำหรับผู้ป่วยโรคหลอดเลือดสมองที่บ้าน",
  105: "การฝึกพูดสำหรับผู้ป่วยโรคหลอดเลือดสมอง",
  106: "10 ท่า ทรงตัวมั่นคง ยืนเดินปลอดภัย | งานกายภาพบำบัด โรงพยาบาลราชวิถี",
  200: "โภชนาการสำหรับผู้ป่วยโรคหลอดเลือดสมอง",
  201: "อาหารที่ควรหลีกเลี่ยงสำหรับผู้ป่วยโรคหลอดเลือดสมอง",
  300: "ความรู้เรื่องยาสำหรับผู้ป่วยโรคหลอดเลือดสมอง",
  400: "เสริมพลังใจสำหรับผู้ป่วยโรคหลอดเลือดสมอง",
  401: "กำลังใจและแรงบันดาลใจ",
  402: "พลังใจในการฟื้นฟู",
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const pid = query.pid ? String(query.pid) : null;
  const video_id = query.video_id ? Number(query.video_id) : null;

  const db = getDb();
  let sql = "SELECT video_id, COUNT(*) as view_count FROM stk_video_view_log WHERE 1=1";
  const params: (string | number)[] = [];
  if (pid) { sql += " AND pid = ?"; params.push(pid); }
  if (video_id) { sql += " AND video_id = ?"; params.push(video_id); }
  sql += " GROUP BY video_id ORDER BY view_count DESC";

  const [rows] = await db.execute<RowDataPacket[]>(sql, params);
  const data = rows.map(r => ({
    video_id: r.video_id,
    view_count: Number(r.view_count),
    video_title: VIDEO_TITLE_MAP[Number(r.video_id)] || String(r.video_id),
  }));
  return { success: true, data };
});
