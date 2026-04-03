# คู่มือการติดตั้งระบบ (Deployment Guide)

คู่มือนี้สำหรับติดตั้งระบบติดตามแผนงาน โครงการ บนเครื่อง Server โดยใช้ Docker

## 1. การเตรียมความพร้อม (Prerequisites)
เครื่อง Server ควรติดตั้ง Docker และ Docker Compose เรียบร้อยแล้ว:
```bash
sudo apt update && sudo apt install docker.io docker-compose git -y
```

## 2. การดึง Source Code และเตรียมโฟลเดอร์
1. Clone โปรเจกต์จาก GitHub:
   ```bash
   git clone [URL_GITHUB_YOUR_REPO]
   cd project-tracker
   ```
2. สร้างโฟลเดอร์สำหรับจัดเก็บไฟล์ (สำคัญมากสำหรับการทำ Persistence):
   ```bash
   mkdir -p storage/uploads
   # ปรับเจ้าของโฟลเดอร์ให้เป็น User ปัจจุบัน และตั้งสิทธิ์เป็น 755 (ปลอดภัยกว่า 777)
   sudo chown -R $USER:$USER storage
   chmod -R 755 storage
   ```

## 3. การตั้งค่าสภาพแวดล้อม (.env)
สร้างไฟล์ `.env` ที่ root ของโปรเจกต์:
```bash
cp .env.example .env  # หรือ nano .env
```
**ค่าที่ต้องแก้ไข:**
- `DB_PASSWORD`: รหัสผ่านสำหรับฐานข้อมูล
- `JWT_SECRET`: รหัสลับสำหรับ Token (สร้างใหม่โดยใช้ `openssl rand -base64 32`)
- `THAID_CLIENT_ID` / `THAID_CLIENT_SECRET`: จากกรมการปกครอง
- `THAID_REDIRECT_URI`: ต้องตรงกับที่ลงทะเบียนไว้ (เช่น https://your-domain.com/api/auth/thaid/callback)
- `DISCORD_WEBHOOK_URL` / `TELEGRAM_*`: สำหรับระบบแจ้งเตือน
- `NODE_ENV`: กำหนดเป็น `production`

## 4. การนำเข้าข้อมูลตั้งต้น (Import Data)
หากคุณต้องการใช้ข้อมูลตัวอย่างจากเครื่องพัฒนา ให้ใช้ไฟล์ `backup.sql` ที่แนบไป:
1. ส่งไฟล์ `backup.sql` ขึ้นเครื่อง Server
2. รันเฉพาะฐานข้อมูลขึ้นมาก่อน:
   ```bash
   docker compose up -d db
   ```
3. รันคำสั่ง Import (รอฐานข้อมูลพร้อมประมาณ 10 วินาที):
   ```bash
   docker compose exec -T db mariadb -u root -p[รหัสผ่านที่คุณตั้งใน .env] project_tracker < backup.sql
   ```

## 5. เริ่มรันระบบ
รันคำสั่ง Build และ Start containers ทั้งหมด:
```bash
docker compose up -d --build
```

## 6. การดูแลรักษาและสำรองข้อมูล
- **ไฟล์อัปโหลด**: ข้อมูลจะถูกเก็บไว้ที่เครื่อง Host ในโฟลเดอร์ `./storage` ควรทำการ Backup โฟลเดอร์นี้เป็นประจำ
- **ฐานข้อมูล**: สามารถรันคำสั่ง Backup ได้ดังนี้:
  ```bash
  docker compose exec db mariadb-dump -u root -p[รหัสผ่าน] project_tracker > backup_$(date +%F).sql
  ```

## 7. ข้อควรระวังเรื่อง ThaiID
- ระบบ OIDC ของกรมการปกครองบังคับใช้ **HTTPS** เท่านั้นในโหมด Production
- แนะนำให้ใช้ **Nginx Proxy Manager** หรือ **Cloudflare** ในการทำ SSL
- หาก URL เปลี่ยนแปลง ต้องแจ้งแก้ไข `Redirect URI` กับเจ้าหน้าที่กรมการปกครองทันที
