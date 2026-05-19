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

## สิ่งที่ต้องเตรียมก่อนติดตั้ง

| รายการ | เวอร์ชัน |
|---|---|
| Node.js | 20.x LTS ขึ้นไป |
| MySQL | 8.0 ขึ้นไป |
| PM2 | ล่าสุด |
| OS | Ubuntu 20.04+ / Debian 11+ / CentOS 8+ |

**ตรวจสอบว่ามี Node.js หรือยัง:**
```bash
node -v
```

ถ้ายังไม่มี ให้ติดตั้ง Node.js 20 ก่อน:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## วิธีติดตั้ง (ทำตามลำดับ)

---

### ขั้นตอนที่ 1 — คัดลอกไฟล์โปรเจคไปยัง Server

**1.1** คัดลอกโฟลเดอร์โปรเจคทั้งหมดไปไว้บน server เช่น:

```bash
# กรณีใช้ scp (แทนที่ user และ server-ip ด้วยค่าจริง)
scp -r stroke-befast/ user@server-ip:/var/www/stroke-befast

# กรณีใช้ git clone
git clone https://github.com/<username>/stroke-befast.git /var/www/stroke-befast
```

**1.2** เข้าไปยังโฟลเดอร์โปรเจค:

```bash
cd /var/www/stroke-befast
```

> คำสั่งทั้งหมดหลังจากนี้ให้รันจากในโฟลเดอร์นี้เสมอ

---

### ขั้นตอนที่ 2 — เตรียมฐานข้อมูล MySQL

**2.1** เปิด terminal แล้วเข้าสู่ MySQL ในฐานะ root:

```bash
mysql -u root -p
```

> ระบบจะถาม password — ให้ใส่ password ของ MySQL root

**2.2** เมื่ออยู่ใน MySQL prompt (`mysql>`) ให้รันคำสั่งต่อไปนี้ทีละบรรทัด  
*(เปลี่ยน `your_password` เป็นรหัสผ่านที่ต้องการสำหรับระบบนี้)*

```sql
CREATE DATABASE IF NOT EXISTS stroke
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

```sql
CREATE USER IF NOT EXISTS 'stroke_user'@'localhost' IDENTIFIED BY 'your_password';
```

```sql
GRANT ALL PRIVILEGES ON stroke.* TO 'stroke_user'@'localhost';
```

```sql
FLUSH PRIVILEGES;
```

```sql
EXIT;
```

> จดบันทึก `stroke_user` และ `your_password` ที่ตั้งไว้ เพื่อใช้ในขั้นตอนที่ 4

**2.3** รัน script สร้างตาราง — กลับมาที่ terminal (ไม่ใช่ MySQL prompt) แล้วรันคำสั่งนี้จากในโฟลเดอร์โปรเจค:

```bash
mysql -u stroke_user -p stroke < scripts/init.sql
```

> ระบบจะถาม password — ให้ใส่ `your_password` ที่ตั้งไว้ในขั้นตอน 2.2

**2.4** ตรวจสอบว่าสร้างตารางสำเร็จ:

```bash
mysql -u stroke_user -p stroke -e "SHOW TABLES;"
```

ผลลัพธ์ที่ถูกต้องจะแสดงรายการตาราง เช่น `stk_admin_users`, `stk_personinfo` เป็นต้น

**บัญชีผู้ดูแลระบบเริ่มต้น (สร้างโดย init.sql):**

| รายการ | ค่า |
|---|---|
| Username | `admin` |
| Password | `Admin1234` |

> ⚠️ **ต้องเปลี่ยนรหัสผ่านทันทีหลังติดตั้งเสร็จ** ที่หน้า Admin → จัดการผู้ใช้งาน

---

### ขั้นตอนที่ 3 — ติดตั้ง Dependencies

จากในโฟลเดอร์โปรเจค รันคำสั่ง:

```bash
npm install
```

> รอจนเสร็จ (อาจใช้เวลา 1–2 นาที ขึ้นอยู่กับความเร็วอินเทอร์เน็ต)

---

### ขั้นตอนที่ 4 — ตั้งค่า Environment Variables

**4.1** คัดลอกไฟล์ตัวอย่าง:

```bash
cp .env.example .env
```

**4.2** เปิดไฟล์ `.env` เพื่อแก้ไข:

```bash
nano .env
```

**4.3** แก้ไขค่าต่อไปนี้ให้ตรงกับ server ของท่าน:

| ตัวแปร | คำอธิบาย | ตัวอย่าง |
|---|---|---|
| `NUXT_DB_HOST` | IP หรือ hostname ของ MySQL | `localhost` |
| `NUXT_DB_PORT` | Port ของ MySQL (Linux ปกติคือ `3306`) | `3306` |
| `NUXT_DB_USER` | ชื่อ user ที่สร้างในขั้นตอน 2.2 | `stroke_user` |
| `NUXT_DB_PASS` | รหัสผ่านที่ตั้งในขั้นตอน 2.2 | `your_password` |
| `NUXT_DB_NAME` | ชื่อ database | `stroke` |
| `NUXT_PUBLIC_BASE_PATH` | ปล่อยว่างถ้าเข้าผ่าน root path | *(ว่าง)* |
| `NUXT_PUBLIC_MANUAL_URL` | URL คู่มือผู้ใช้ (ถ้ามี) | *(ว่างได้)* |
| `NUXT_PUBLIC_ADMIN_MANUAL_URL` | URL คู่มือผู้ดูแล (ถ้ามี) | *(ว่างได้)* |
| `NUXT_PUBLIC_ASSESSMENT_FORM_URL` | URL แบบประเมิน (ถ้ามี) | *(ว่างได้)* |
| `NUXT_APPOINTMENT_API_URL` | URL API นัดหมาย HIS (ถ้ามี) | *(ว่างได้)* |

**4.4** บันทึกและออกจาก nano:
- กด `Ctrl + O` แล้ว `Enter` เพื่อบันทึก
- กด `Ctrl + X` เพื่อออก

> **ค่าที่ห้ามเปลี่ยน** — สองบรรทัดนี้ให้คงไว้ตามเดิม:
> ```
> NUXT_PUBLIC_THAID_CLIENT_ID=NjZrZlpoZTdVM2xUSXA0dXZ2YVF0WmIyam1HVnJUcXU
> NUXT_THAID_API_URL=https://hatyaihospital.go.th/ThaiD/api-ext/
> ```

---

### ขั้นตอนที่ 5 — ปิด DevTools แล้ว Build

**5.1** เปิดไฟล์ `nuxt.config.ts`:

```bash
nano nuxt.config.ts
```

**5.2** หาบรรทัด `devtools` แล้วเปลี่ยนจาก `true` เป็น `false`:

```ts
devtools: { enabled: false },
```

บันทึกและออก (`Ctrl + O` → `Enter` → `Ctrl + X`)

**5.3** Build application:

```bash
npm run build
```

> รอจนเสร็จ (ประมาณ 1–3 นาที) จะเห็น output ปิดท้ายด้วย `✓ Generated`  
> ไฟล์ production จะอยู่ที่โฟลเดอร์ `.output/`

---

### ขั้นตอนที่ 6 — ตั้งค่าและรันด้วย PM2

**6.1** ติดตั้ง PM2 (ถ้ายังไม่มี):

```bash
sudo npm install -g pm2
```

**6.2** สร้างโฟลเดอร์สำหรับเก็บ log:

```bash
mkdir -p logs
```

**6.3** เปิดไฟล์ `ecosystem.config.cjs` เพื่อแก้ไข path:

```bash
nano ecosystem.config.cjs
```

**6.4** แก้ไขบรรทัด `cwd` ให้ตรงกับ path จริงของโปรเจคบน server:

```js
cwd: "/var/www/stroke-befast",   // ← เปลี่ยนตรงนี้ให้ตรงกับ path จริง
```

บันทึกและออก (`Ctrl + O` → `Enter` → `Ctrl + X`)

**6.5** เริ่มต้น application ด้วย PM2:

```bash
pm2 start ecosystem.config.cjs
```

**6.6** ตั้งค่าให้ application เริ่มอัตโนมัติเมื่อ server รีสตาร์ท:

```bash
pm2 save
```

```bash
pm2 startup
```

> PM2 จะแสดงคำสั่งให้รัน — **คัดลอกคำสั่งนั้นมาวางแล้วกด Enter** (มีลักษณะคล้ายตัวอย่างนี้):
> ```bash
> sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
> ```

---

### ขั้นตอนที่ 7 — ตรวจสอบและทดสอบระบบ

**7.1** ตรวจสอบว่า application รันอยู่:

```bash
pm2 list
```

ผลลัพธ์ที่ถูกต้อง — status จะแสดงว่า **online**:

```
┌────┬────────────────┬─────────┬─────────┬──────────┐
│ id │ name           │ mode    │ ↺       │ status   │
├────┼────────────────┼─────────┼─────────┼──────────┤
│ 0  │ stroke-befast  │ fork    │ 0       │ online   │
└────┴────────────────┴─────────┴─────────┴──────────┘
```

**7.2** เปิดเบราว์เซอร์แล้วไปที่:

```
http://[IP ของ server]:3000
```

**7.3** ทดสอบเข้าสู่ระบบ Admin ที่:

```
http://[IP ของ server]:3000/admin/login
```

- **Username:** `admin`
- **Password:** `Admin1234`

**7.4** ⚠️ เปลี่ยนรหัสผ่าน admin ทันที ที่เมนู **จัดการผู้ใช้งาน → แก้ไขบัญชี admin**

---

## คำสั่ง PM2 ที่ใช้บ่อย

| คำสั่ง | ความหมาย |
|---|---|
| `pm2 list` | ดูสถานะ application ทั้งหมด |
| `pm2 logs stroke-befast` | ดู log แบบ real-time |
| `pm2 restart stroke-befast` | รีสตาร์ท application |
| `pm2 stop stroke-befast` | หยุด application |
| `pm2 monit` | ดู CPU / Memory |

**หลัง build ใหม่ทุกครั้ง ให้รัน:**

```bash
npm run build && pm2 restart stroke-befast
```

---

## การตั้งค่า Nginx (ไม่บังคับ — ใช้ถ้าต้องการ port 80)

**ติดตั้ง Nginx:**

```bash
sudo apt install -y nginx
```

**สร้าง config:**

```bash
sudo nano /etc/nginx/sites-available/stroke-befast
```

วางเนื้อหาต่อไปนี้ (เปลี่ยน `your-domain.com` เป็น domain หรือ IP ของ รพ.):

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

**เปิดใช้งาน:**

```bash
sudo ln -s /etc/nginx/sites-available/stroke-befast /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

หลังจากนั้นเข้าผ่าน `http://your-domain.com` ได้เลย

---

## การแก้ปัญหาเบื้องต้น

**ดู error log:**
```bash
pm2 logs stroke-befast --lines 50
```

**ไม่สามารถเชื่อมต่อฐานข้อมูล:**
```bash
# ตรวจสอบว่า MySQL รันอยู่บน port ใด
sudo netstat -tlnp | grep mysql

# ทดสอบ login ด้วย user ที่สร้างไว้
mysql -u stroke_user -p stroke -e "SHOW TABLES;"
```

**Port 3000 ถูกใช้งานอยู่แล้ว:**
```bash
sudo lsof -i :3000
```
แล้วเปลี่ยน `PORT` ใน `ecosystem.config.cjs` เป็น port อื่น เช่น `3001`

**Permission denied:**
```bash
sudo chown -R $USER:$USER /var/www/stroke-befast
```

---

## Tech Stack

- [Nuxt 4](https://nuxt.com/) + [Vue 3](https://vuejs.org/)
- [DaisyUI v5](https://daisyui.com/) + [Tailwind CSS v4](https://tailwindcss.com/)
- [MySQL 8](https://www.mysql.com/) via [mysql2](https://github.com/sidorares/node-mysql2)
- [Pinia](https://pinia.vuejs.org/) (State Management)
- [PM2](https://pm2.keymetrics.io/) (Process Manager)
- ThaiD Authentication

---

## ติดต่อ

พัฒนาโดยทีม IT โรงพยาบาลหาดใหญ่  
สำหรับการสอบถามหรือรายงานปัญหา กรุณาเปิด Issue ใน repository นี้
