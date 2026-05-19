/**
 * PM2 Ecosystem Configuration — Stroke-BEFAST Application
 *
 * วิธีใช้:
 *   1. แก้ไข cwd ให้ตรงกับ path ของโปรเจคบน server ของท่าน
 *   2. pm2 start ecosystem.config.cjs
 *   3. pm2 save
 */
module.exports = {
  apps: [
    {
      name: "stroke-befast",

      // คำสั่งเริ่มต้น application (Nuxt 4 production server)
      script: "node",
      args: ".output/server/index.mjs",

      // *** แก้ไข path นี้ให้ตรงกับโฟลเดอร์โปรเจคบน server ***
      // ตัวอย่าง: "/var/www/stroke-befast"  หรือ  "/home/ubuntu/stroke-befast"
      cwd: "/var/www/stroke-befast",

      // Environment
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      // กำหนดจำนวน instance (แนะนำ 1 สำหรับ server ทั่วไป)
      instances: 1,

      // รีสตาร์ทอัตโนมัติเมื่อ app crash
      autorestart: true,

      // ไม่ต้อง watch ไฟล์ใน production
      watch: false,

      // รีสตาร์ทเมื่อ memory เกิน 512 MB
      max_memory_restart: "512M",

      // ไฟล์ log (ต้องสร้าง folder logs/ ก่อน)
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",

      // delay ก่อน autorestart (ms)
      restart_delay: 3000,
    },
  ],
};
