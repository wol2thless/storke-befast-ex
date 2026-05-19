export default defineEventHandler(async (event) => {
  const data = await readBody(event);
  const {
    pid, name_th, name_en = "", gender = "", birthdate = "",
    occupation = "", otherOccupation = "", education = "", phone = "", address = "",
  } = data;

  if (!pid || !name_th) {
    throw createError({ statusCode: 400, message: "Missing required fields" });
  }

  const genderNorm =
    ["male", "m", "ชาย"].includes(String(gender).toLowerCase()) ? "ชาย" :
    ["female", "f", "หญิง"].includes(String(gender).toLowerCase()) ? "หญิง" : "ไม่ระบุ";

  const otherOcc = occupation === "อื่น ๆ" ? otherOccupation : "";
  const addressStr = typeof address === "object" && address?.formatted
    ? address.formatted : String(address || "");

  const db = getDb();
  const [existing] = await db.execute<import("mysql2").RowDataPacket[]>(
    "SELECT id FROM stk_personinfo WHERE pid = ?", [pid]
  );

  if ((existing as unknown[]).length > 0) {
    await db.execute(
      `UPDATE stk_personinfo SET name_th=?, name_en=?, gender=?, birthdate=?,
       occupation=?, otherOccupation=?, education=?, phone=?, address=?, updated_at=NOW()
       WHERE pid=?`,
      [name_th, name_en, genderNorm, birthdate, occupation, otherOcc, education, phone, addressStr, pid]
    );
  } else {
    await db.execute(
      `INSERT INTO stk_personinfo (pid, name_th, name_en, gender, birthdate, occupation, otherOccupation, education, phone, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [pid, name_th, name_en, genderNorm, birthdate, occupation, otherOcc, education, phone, addressStr]
    );
  }

  return {
    success: true,
    message: (existing as unknown[]).length > 0 ? "Updated" : "Created",
    data: { pid, occupation, otherOccupation: otherOcc, education, phone },
  };
});
