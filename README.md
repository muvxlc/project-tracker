# MIS - Management Information System

ระบบสารสนเทศบริหารจัดการ (Management Information System) สำหรับจัดการผู้ใช้งาน หน่วยงาน และสิทธิ์การใช้งาน

## คุณสมบัติหลัก

- 🔐 **ระบบ Authentication**: รองรับการล็อกอินด้วย username/password และ ThaiID
- 👥 **จัดการผู้ใช้งาน**: เพิ่ม แก้ไข ลบ และจัดการข้อมูลผู้ใช้งาน
- 🏢 **จัดการหน่วยงาน**: จัดการโครงสร้างองค์กรและหน่วยงาน
- 🛡️ **จัดการสิทธิ์ (RBAC)**: กำหนดสิทธิ์การใช้งานแยกตามบทบาท (superadmin, admin, user)
- 🌐 **รองรับภาษาไทย**: ออกแบบมาเพื่อรองรับภาษาไทยอย่างเต็มรูปแบบ

## เทคโนโลยีที่ใช้

- **Frontend**: Nuxt 4 + Vue 3 + Nuxt UI
- **Backend**: Nuxt Server (Nitro)
- **Database**: MySQL + Drizzle ORM
- **Authentication**: JWT + ThaiID (กรมการปกครอง)
- **Styling**: Tailwind CSS

## การติดตั้ง

```bash
# ติดตั้ง dependencies
npm install

# คัดลอกไฟล์ environment
cp .env.example .env

# แก้ไขค่าตั้งค่าใน .env
# - DATABASE_URL: สตริงการเชื่อมต่อฐานข้อมูล MySQL
# - JWT_SECRET: คีย์สำหรับ signing JWT tokens
# - THAID_CLIENT_ID: Client ID สำหรับ ThaiID
# - THAID_CLIENT_SECRET: Client Secret สำหรับ ThaiID
# - THAID_REDIRECT_URI: URL สำหรับ callback หลัง login ผ่าน ThaiID

# สร้างตารางฐานข้อมูล
npm run db:push

# Seeding ข้อมูลเริ่มต้น (admin user)
npm run db:seed หรือ npx tsx server/scripts/seed.ts
```

## การรันโปรเจกต์

```bash
# โหมด Development
npm run dev

# โหมด Production
npm run build
npm run preview
```

## บัญชีผู้ใช้เริ่มต้น

หลังจาก run seed จะมีบัญชี admin ดังนี้:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **ควรเปลี่ยนรหัสผ่านหลังจากการติดตั้งครั้งแรก**

## โครงสร้างโปรเจกต์

```
mis/
├── pages/              # Vue Pages
│   ├── index.vue      # Dashboard / Landing Page
│   ├── login.vue      # Login Page
│   └── admin/         # Admin Pages
│       └── users.vue  # User Management
├── server/
│   ├── api/           # API Endpoints
│   │   ├── auth/      # Authentication APIs
│   │   └── admin/     # Admin APIs
│   ├── database/      # Database Schema & Config
│   ├── utils/         # Utility Functions
│   │   ├── auth.ts    # JWT & Auth utilities
│   │   ├── db.ts      # Database connection
│   │   └── thaid.ts   # ThaiID integration
│   └── scripts/       # Database Scripts
│       └── seed.ts    # Seed data
└── composables/       # Vue Composables
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password
- `GET /api/auth/thaid/login` - Login with ThaiID
- `GET /api/auth/thaid/callback` - ThaiID OAuth callback
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user info

### Admin
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PATCH /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user
- `GET /api/admin/roles` - List all roles
- `GET /api/admin/agencies` - List all agencies

## License

MIT
