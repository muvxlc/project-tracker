import { db } from '../utils/db';
import { roles, users, projectStatuses } from '../database/schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding roles...');
  const roleNames = ['superadmin', 'admin', 'approver', 'user'];
  for (const name of roleNames) {
    await db.insert(roles).values({ name }).onDuplicateKeyUpdate({ set: { name } });
  }

  console.log('Seeding project statuses...');
  const statuses = [
    { name: 'รับเอกสาร', color: 'orange', order: 1 },
    { name: 'ตรวจสอบ', color: 'yellow', order: 2 },
    { name: 'อนุมัติ', color: 'green', order: 3 },
    { name: 'ส่งกลับแก้ไข', color: 'red', order: 4 }
  ];
  for (const status of statuses) {
    await db.insert(projectStatuses).values(status).onDuplicateKeyUpdate({ set: { color: status.color, order: status.order } });
  }

  console.log('Seeding superadmin user...');
  const superadminRole = await db.query.roles.findFirst({
    where: (roles, { eq }) => eq(roles.name, 'superadmin'),
  });

  if (superadminRole) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.insert(users).values({
      username: 'admin',
      passwordHash: hashedPassword,
      fullName: 'Super Admin',
      roleId: superadminRole.id,
    }).onDuplicateKeyUpdate({
      set: {
        passwordHash: hashedPassword,
        fullName: 'Super Admin',
        roleId: superadminRole.id,
      }
    });
  }

  console.log('Seeding completed!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
