# ระบบ Stroke-BEFAST

ระบบติดตามและดูแลผู้ป่วยโรคหลอดเลือดสมอง สำหรับโรงพยาบาล  
พัฒนาด้วย **Nuxt 4**, **Vue 3**, **MySQL** และ **ThaiD Authentication**

---

## ฟีเจอร์หลัก

- ยืนยันตัวตนด้วยบัตรประชาชน (ThaiD)
- บันทึกการประเมิน BEFAST และ ADL
- ติดตามการออกกำลังกาย โภชนาการ และการรับประทานยา
- วิดีโอความรู้สำหรับผู้ป่วยและผู้ดูแล
- แบบสอบถามความพึงพอใจ
- Dashboard สรุปสถิติสำหรับผู้ดูแลระบบ
- รองรับการใช้งานบนมือถือ

---

## ข้อกำหนดระบบ

| รายการ | เวอร์ชัน |
|---|---|
| Node.js | 20.x LTS ขึ้นไป |
| MySQL | 8.0 ขึ้นไป |
| PM2 | ล่าสุด |
| OS | Ubuntu 20.04+ / Debian 11+ / CentOS 8+ |

ตรวจสอบ Node.js:
```bash
node -v
```

ติดตั้ง Node.js 20 (ถ้ายังไม่มี):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## วิธีติดตั้ง

### ขั้นตอนที่ 1 — เตรียมฐานข้อมูล MySQL

เข้าสู่ MySQL ในฐานะ root:
```bash
mysql -u root -p
```

สร้าง database และ user (เปลี่ยน `your_password` เป็นรหัสผ่านของท่าน):
```sql
CREATE DATABASE IF NOT EXISTS stroke
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'stroke_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON stroke.* TO 'stroke_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

สร้างตารางและข้อมูลเริ่มต้น:
```bash
mysql -u stroke_user -p stroke < scripts/init.sql
```

**บัญชีผู้ดูแลระบบเริ่มต้น:**

| รายการ | ค่า |
|---|---|
| Username | `admin` |
| Password | `Admin1234` |

> ⚠️ เปลี่ยนรหัสผ่านทันทีหลังติดตั้งเสร็จ

---

### ขั้นตอนที่ 2 — ติดตั้งโปรเจค

Clone หรือคัดลอกไฟล์โปรเจคไปยัง server:
```bash
git clone <repository-url> /var/www/stroke-befast
cd /var/www/stroke-befast
npm install
```

---

### ขั้นตอนที่ 3 — ตั้งค่า Environment Variables

```bash
cp .env.example .env
nano .env
```

**ค่าที่ต้องแก้ไข:**

| ตัวแปร | คำอธิบาย |
|---|---|
| `NUXT_DB_HOST` | IP หรือ hostname ของ MySQL (ปกติ `localhost`) |
| `NUXT_DB_PORT` | Port MySQL (Linux ปกติ `3306`) |
| `NUXT_DB_USER` | ชื่อ user MySQL ที่สร้างในขั้นตอนที่ 1 |
| `NUXT_DB_PASS` | รหัสผ่าน MySQL |
| `NUXT_DB_NAME` | ชื่อ database (`stroke`) |
| `NUXT_PUBLIC_BASE_PATH` | Base path เช่น `/stroke` ถ้าใช้ Nginx sub-path (ปล่อยว่างถ้าเป็น root) |
| `NUXT_PUBLIC_MANUAL_URL` | URL คู่มือผู้ใช้งาน (ปล่อยว่างได้) |
| `NUXT_PUBLIC_ADMIN_MANUAL_URL` | URL คู่มือผู้ดูแลระบบ (ปล่อยว่างได้) |
| `NUXT_PUBLIC_ASSESSMENT_FORM_URL` | URL แบบประเมิน (ปล่อยว่างได้) |
| `NUXT_APPOINTMENT_API_URL` | URL API ระบบนัดหมาย HIS (ปล่อยว่างได้ถ้าไม่มี) |

**ค่าที่ห้ามเปลี่ยน** (ค่าของระบบ ThaiD กลาง):
```
NUXT_PUBLIC_THAID_CLIENT_ID=NjZrZlpoZTdVM2xUSXA0dXZ2YVF0WmIyam1HVnJUcXU
NUXT_THAID_API_URL=https://hatyaihospital.go.th/ThaiD/api-ext/
```

---

### ขั้นตอนที่ 4 — Build Application

แก้ไข `nuxt.config.ts` บรรทัด `devtools` ให้เป็น `false` ก่อน build:
```ts
devtools: { enabled: false },
```

จากนั้น build:
```bash
npm run build
```

รอจนเสร็จ (ประมาณ 1–3 นาที) ไฟล์ production จะอยู่ที่ `.output/`

---

### ขั้นตอนที่ 5 — รันด้วย PM2

ติดตั้ง PM2 (ถ้ายังไม่มี):
```bash
sudo npm install -g pm2
```

สร้างโฟลเดอร์ log:
```bash
mkdir -p logs
```

แก้ไข `ecosystem.config.cjs` บรรทัด `cwd` ให้ตรงกับ path จริง:
```js
cwd: "/var/www/stroke-befast",   // ← แก้ตรงนี้
```

เริ่มต้น application:
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

คัดลอกคำสั่งที่ PM2 แสดงขึ้นมา แล้วรันตามที่แสดง

---

### ขั้นตอนที่ 6 — ทดสอบระบบ

ตรวจสอบสถานะ:
```bash
pm2 list
```

เปิดเบราว์เซอร์: `http://[IP_server]:3000`  
Admin panel: `http://[IP_server]:3000/admin/login`

---

## คำสั่ง PM2 ที่ใช้บ่อย

```bash
pm2 list                          # ดูสถานะทั้งหมด
pm2 logs stroke-befast            # ดู log real-time
pm2 restart stroke-befast         # รีสตาร์ท
pm2 stop stroke-befast            # หยุด
pm2 monit                         # ดู CPU/Memory
```

หลัง build ใหม่:
```bash
npm run build && pm2 restart stroke-befast
```

---

## การตั้งค่า Nginx (ถ้าต้องการใช้ port 80)

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/stroke-befast
```

เนื้อหาไฟล์:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/stroke-befast /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## การแก้ปัญหาเบื้องต้น

**ดู log:**
```bash
pm2 logs stroke-befast --lines 50
```

**ไม่สามารถเชื่อมต่อ MySQL:**
```bash
# ตรวจสอบ port ที่ MySQL รัน
sudo netstat -tlnp | grep mysql

# ทดสอบ login
mysql -u stroke_user -p -e "SHOW DATABASES;"
```

**Port 3000 ถูกใช้งานอยู่:**
```bash
sudo lsof -i :3000
# เปลี่ยน PORT ใน ecosystem.config.cjs แล้ว restart
```

**Permission denied:**
```bash
sudo chown -R $USER:$USER /var/www/stroke-befast
```

---

## Tech Stack

- [Nuxt 4](https://nuxt.com/) + [Vue 3](https://vuejs.org/)
- [DaisyUI v5](https://daisyui.com/) + [Tailwind CSS v4](https://tailwindcss.com/)
- [MySQL 8](https://www.mysql.com/) + [mysql2](https://github.com/sidorares/node-mysql2)
- [Pinia](https://pinia.vuejs.org/) (State Management)
- [PM2](https://pm2.keymetrics.io/) (Process Manager)
- ThaiD Authentication

---

## ติดต่อ

พัฒนาโดยทีม IT โรงพยาบาลหาดใหญ่  
สำหรับการสอบถามหรือรายงานปัญหา กรุณาเปิด Issue ใน repository นี้
