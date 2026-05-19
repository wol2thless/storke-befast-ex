# คู่มือติดตั้งระบบ Stroke-BEFAST

ระบบติดตามและดูแลผู้ป่วยโรคหลอดเลือดสมอง  
พัฒนาด้วย Nuxt 4, Vue 3, MySQL และ ThaiD Authentication

---

## ข้อกำหนดระบบ

| รายการ | เวอร์ชันที่รองรับ |
|---|---|
| Node.js | 20.x LTS ขึ้นไป (แนะนำ 20 หรือ 22) |
| MySQL | 8.0 ขึ้นไป |
| PM2 | ล่าสุด (ติดตั้งผ่าน npm) |
| ระบบปฏิบัติการ | Ubuntu 20.04+ / CentOS 8+ / Debian 11+ |

ตรวจสอบเวอร์ชัน Node.js:
```bash
node -v
```

ถ้ายังไม่มี Node.js แนะนำติดตั้งผ่าน [NodeSource](https://github.com/nodesource/distributions):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## ขั้นตอนที่ 1: เตรียมฐานข้อมูล MySQL

### 1.1 สร้าง database และ user

เข้าสู่ MySQL ในฐานะ root:
```bash
mysql -u root -p
```

รันคำสั่งต่อไปนี้ (เปลี่ยน `your_password` เป็นรหัสผ่านที่ต้องการ):
```sql
CREATE DATABASE IF NOT EXISTS stroke
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'stroke_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON stroke.* TO 'stroke_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

> **หมายเหตุ**: จดบันทึก username (`stroke_user`) และ password ที่ตั้งไว้ เพื่อใช้ในขั้นตอนตั้งค่า `.env`

### 1.2 สร้างตารางและข้อมูลเริ่มต้น

รัน script สร้างตาราง (init.sql อยู่ในโฟลเดอร์ `scripts/`):
```bash
mysql -u stroke_user -p stroke < scripts/init.sql
```

Script นี้จะสร้าง:
- ตารางทั้งหมดที่ระบบต้องการ
- บัญชีผู้ดูแลระบบเริ่มต้น

**บัญชีผู้ดูแลระบบ (default):**

| รายการ | ค่า |
|---|---|
| Username | `admin` |
| Password | `Admin1234` |

> ⚠️ **สำคัญ**: เปลี่ยนรหัสผ่านทันทีหลังติดตั้งเสร็จ ที่หน้า `/admin/users`

---

## ขั้นตอนที่ 2: ติดตั้งโปรเจค

### 2.1 คัดลอกไฟล์โปรเจค

คัดลอกโฟลเดอร์โปรเจคทั้งหมดไปยัง server เช่น:
```bash
# ตัวอย่างใช้ scp
scp -r stroke-befast/ user@server:/var/www/stroke-befast

# หรือ git clone (ถ้ามี git repository)
git clone <repository-url> /var/www/stroke-befast
```

### 2.2 เข้าไปในโฟลเดอร์โปรเจค

```bash
cd /var/www/stroke-befast
```

### 2.3 ติดตั้ง dependencies

```bash
npm install
```

---

## ขั้นตอนที่ 3: ตั้งค่า Environment Variables

### 3.1 คัดลอกไฟล์ตัวอย่าง

```bash
cp .env.example .env
```

### 3.2 แก้ไขไฟล์ .env

```bash
nano .env
```

**ค่าที่ต้องแก้ไข:**

| ตัวแปร | คำอธิบาย | ตัวอย่าง |
|---|---|---|
| `NUXT_DB_HOST` | IP หรือ hostname ของ MySQL server | `localhost` |
| `NUXT_DB_PORT` | Port ของ MySQL (ปกติ `3306`) | `3306` |
| `NUXT_DB_USER` | ชื่อ user MySQL ที่สร้างในขั้นตอนที่ 1 | `stroke_user` |
| `NUXT_DB_PASS` | รหัสผ่าน MySQL | `your_password` |
| `NUXT_DB_NAME` | ชื่อ database | `stroke` |
| `NUXT_PUBLIC_BASE_PATH` | Base path ของแอป (ถ้าใช้ Nginx sub-path เช่น `/stroke`) | ว่างไว้ถ้าเป็น root |
| `NUXT_PUBLIC_MANUAL_URL` | URL คู่มือการใช้งาน (ถ้ามี) | ว่างไว้ได้ |
| `NUXT_PUBLIC_ADMIN_MANUAL_URL` | URL คู่มือผู้ดูแลระบบ (ถ้ามี) | ว่างไว้ได้ |
| `NUXT_PUBLIC_ASSESSMENT_FORM_URL` | URL แบบประเมิน (ถ้ามี) | ว่างไว้ได้ |
| `NUXT_APPOINTMENT_API_URL` | URL API ระบบนัดหมาย HIS (ถ้ามี) | ว่างไว้ได้ |

> **MySQL Port**: Linux server ทั่วไปใช้ `3306` — ถ้าติดตั้ง MySQL ผ่าน apt/yum ให้ใช้ `3306`

**ค่าที่ห้ามเปลี่ยน (คงไว้ตามที่กำหนด):**

```
NUXT_PUBLIC_THAID_CLIENT_ID=NjZrZlpoZTdVM2xUSXA0dXZ2YVF0WmIyam1HVnJUcXU
NUXT_THAID_API_URL=https://hatyaihospital.go.th/ThaiD/api-ext/
```

> ค่าทั้งสองนี้เชื่อมกับระบบ ThaiD กลาง ห้ามเปลี่ยนแปลง มิฉะนั้นการยืนยันตัวตนด้วยบัตรประชาชนจะไม่ทำงาน

---

## ขั้นตอนที่ 4: Build Application

ก่อน build ให้ปิด Nuxt DevTools ใน `nuxt.config.ts`:
```ts
devtools: { enabled: false },  // เปลี่ยนจาก true เป็น false
```

จากนั้น build:
```bash
npm run build
```

ไฟล์ production จะถูกสร้างที่ `.output/` — รอจนเสร็จ (ประมาณ 1-3 นาที)

---

## ขั้นตอนที่ 5: ตั้งค่าและเริ่มต้นด้วย PM2

### 5.1 ติดตั้ง PM2 (ถ้ายังไม่มี)

```bash
sudo npm install -g pm2
```

### 5.2 สร้างโฟลเดอร์ logs

```bash
mkdir -p logs
```

### 5.3 แก้ไข path ใน ecosystem.config.cjs

เปิดไฟล์ `ecosystem.config.cjs`:
```bash
nano ecosystem.config.cjs
```

แก้ไขบรรทัด `cwd` ให้ตรงกับ path จริงของโปรเจคบน server:
```js
cwd: "/var/www/stroke-befast",   // ← แก้ตรงนี้
```

### 5.4 เริ่มต้น Application

```bash
pm2 start ecosystem.config.cjs
```

### 5.5 ตั้งค่าให้เริ่มอัตโนมัติเมื่อ server รีสตาร์ท

```bash
pm2 save
pm2 startup
```

คัดลอกคำสั่งที่ PM2 แสดงขึ้นมา แล้วรันตามที่แสดง (จะมีลักษณะคล้าย):
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

---

## ขั้นตอนที่ 6: ทดสอบระบบ

### 6.1 ตรวจสอบสถานะ PM2

```bash
pm2 list
```

ตัวอย่าง output ที่ถูกต้อง:
```
┌─────┬──────────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name             │ namespace   │ version │ mode    │ status   │
├─────┼──────────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ stroke-befast    │ default     │ N/A     │ fork    │ online   │
└─────┴──────────────────┴─────────────┴─────────┴─────────┴──────────┘
```

### 6.2 เปิดทดสอบในเบราว์เซอร์

เข้าที่: `http://[IP_ของ_server]:3000`

### 6.3 ทดสอบเข้าสู่ระบบ Admin

เข้าที่: `http://[IP_ของ_server]:3000/admin/login`

- **Username**: `admin`
- **Password**: `Admin1234`

> ⚠️ เปลี่ยนรหัสผ่านทันทีที่ **จัดการผู้ใช้งาน → แก้ไขบัญชี admin**

---

## คำสั่ง PM2 ที่ใช้บ่อย

| คำสั่ง | ความหมาย |
|---|---|
| `pm2 list` | ดูสถานะ application ทั้งหมด |
| `pm2 logs stroke-befast` | ดู log แบบ real-time |
| `pm2 restart stroke-befast` | รีสตาร์ท application |
| `pm2 stop stroke-befast` | หยุด application |
| `pm2 delete stroke-befast` | ลบ application ออกจาก PM2 |
| `pm2 monit` | ดู CPU / Memory usage |

หลัง build ใหม่ ให้รีสตาร์ทด้วย:
```bash
npm run build && pm2 restart stroke-befast
```

---

## การตั้งค่า Nginx (ถ้ามี — ไม่บังคับ)

ถ้าต้องการให้เข้าผ่าน port 80 หรือ 443 ให้ตั้งค่า Nginx เป็น reverse proxy:

### ติดตั้ง Nginx

```bash
sudo apt install -y nginx
```

### สร้าง Virtual Host

```bash
sudo nano /etc/nginx/sites-available/stroke-befast
```

ใส่เนื้อหา:
```nginx
server {
    listen 80;
    server_name your-domain.com;   # ← แก้เป็น domain หรือ IP ของ รพ.

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

เปิดใช้งาน:
```bash
sudo ln -s /etc/nginx/sites-available/stroke-befast /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

หลังจากนั้นสามารถเข้าผ่าน `http://your-domain.com` ได้เลย

---

## การแก้ปัญหาเบื้องต้น

### แอปไม่สามารถเชื่อมต่อฐานข้อมูล

ตรวจสอบ log:
```bash
pm2 logs stroke-befast --lines 50
```

สาเหตุที่พบบ่อย:
- `NUXT_DB_PORT` ผิด → ตรวจสอบว่า MySQL รันอยู่ที่ port ใด: `sudo netstat -tlnp | grep mysql`
- รหัสผ่านผิด → ทดสอบ login MySQL ด้วย user ที่ตั้งไว้
- `NUXT_DB_NAME` ผิด → ตรวจสอบ: `mysql -u stroke_user -p -e "SHOW DATABASES;"`

### Port 3000 ถูกใช้งานอยู่แล้ว

```bash
sudo lsof -i :3000
```

เปลี่ยน port ใน `ecosystem.config.cjs`:
```js
env: { NODE_ENV: 'production', PORT: 3001 },  // เปลี่ยนเป็น port ที่ว่าง
```

แล้วรัน `pm2 restart stroke-befast`

### Permission denied เมื่อรัน PM2

```bash
sudo chown -R $USER:$USER /var/www/stroke-befast
```

### Application crash หลัง build

ตรวจสอบว่า build สำเร็จและไฟล์ `.output/server/index.mjs` มีอยู่:
```bash
ls -la .output/server/index.mjs
```

ถ้าไม่มี ให้ build ใหม่:
```bash
npm run build
```

---

## ข้อมูลติดต่อ

สำหรับการสอบถามหรือรายงานปัญหา กรุณาติดต่อทีมพัฒนาโรงพยาบาลหาดใหญ่
