import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2";

interface AdminRow extends RowDataPacket {
  id: number;
  provider_id: string;
  name: string;
  role: string;
  password_hash: string;
  is_active: number;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { provider_id, password } = body;

  if (!provider_id || !password) {
    return { success: false, message: "Provider ID และรหัสผ่านจำเป็นต้องกรอก" };
  }

  const db = getDb();
  const [rows] = await db.execute<AdminRow[]>(
    "SELECT id, provider_id, name, role, password_hash, is_active FROM stk_admin_users WHERE provider_id = ? AND is_active = 1",
    [provider_id.trim()]
  );

  const admin = rows[0];
  if (!admin) {
    return { success: false, message: "ไม่พบผู้ใช้งานในระบบ" };
  }

  const valid = await bcrypt.compare(password.trim(), admin.password_hash);
  if (!valid) {
    return { success: false, message: "รหัสผ่านไม่ถูกต้อง" };
  }

  const token = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");

  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  await db.execute(
    `INSERT INTO stk_admin_sessions (admin_id, token, expires_at, created_at)
     VALUES (?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at), updated_at = NOW()`,
    [admin.id, token, expiresAt]
  );

  return {
    success: true,
    message: "เข้าสู่ระบบสำเร็จ",
    token,
    admin_data: {
      id: admin.id,
      provider_id: admin.provider_id,
      name: admin.name,
      role: admin.role,
    },
  };
});
