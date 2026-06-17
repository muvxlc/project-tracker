import { mysqlTable, varchar, int, timestamp } from 'drizzle-orm/mysql-core';

// Placeholder for HOSxP tables
// We will add Patient, Visit, and other tables in subsequent phases.

export const hosxp_placeholder = mysqlTable('hosxp_placeholder', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }),
  updatedAt: timestamp('updated_at').onUpdateNow(),
});
