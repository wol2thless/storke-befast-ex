import bcrypt from "bcryptjs";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { provider_id, password, name, role } = body || {};
  if (!provider_id || !password || !name) return { success: false, message: "Missing required fields" };

  const db = getDb();
  const hash = await bcrypt.hash(password, 10);
  try {
    await db.execute(
      "INSERT INTO stk_admin_users (provider_id, password, name, role) VALUES (?, ?, ?, ?)",
      [provider_id, hash, name, role || "staff"]
    );
    return { success: true, message: "User created" };
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "ER_DUP_ENTRY") {
      return { success: false, message: "Provider ID already exists" };
    }
    throw err;
  }
});
