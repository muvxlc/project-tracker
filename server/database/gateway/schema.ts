import { mysqlTable, varchar, decimal, date, timestamp, int, text, json } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

export const roles = mysqlTable('roles', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(), // superadmin, admin, approver, user
});

export const agencies = mysqlTable('agencies', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
});

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  thaiId: varchar('thai_id', { length: 13 }).unique(),
  fullName: varchar('full_name', { length: 255 }),
  roleId: int('role_id').notNull().references(() => roles.id),
  agencyId: int('agency_id').references(() => agencies.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const fiscalYears = mysqlTable('fiscal_years', {
  id: int('id').autoincrement().primaryKey(),
  year: int('year').notNull().unique(), // e.g., 2567
});

export const quarters = mysqlTable('quarters', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(), // ไตรมาส 1, 2, 3, 4
});

export const categories = mysqlTable('categories', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
});

export const projectStatuses = mysqlTable('project_statuses', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  color: varchar('color', { length: 50 }).default('blue'),
  order: int('order').default(0),
});

export const responsiblePersons = mysqlTable('responsible_persons', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const projects = mysqlTable('projects', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 500 }).notNull(),
  fiscalYearId: int('fiscal_year_id').notNull().references(() => fiscalYears.id),
  quarterId: int('quarter_id').references(() => quarters.id),
  categoryId: int('category_id').notNull().references(() => categories.id),
  agencyId: int('agency_id').notNull().references(() => agencies.id),
  responsibleId: int('responsible_id').notNull().references(() => responsiblePersons.id),
  statusId: int('status_id').references(() => projectStatuses.id),
  implementationDate: date('implementation_date'),
  completionDate: date('completion_date'),
  budget: decimal('budget', { precision: 15, scale: 2 }).default('0.00'),
  status: varchar('status', { length: 50 }).default('pending'), // DEPRECATED
  description: text('description'),
  createdById: int('created_by_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
});

export const projectFiles = mysqlTable('project_files', {
  id: int('id').autoincrement().primaryKey(),
  uuid: varchar('uuid', { length: 36 }).notNull().unique(),
  projectId: int('project_id').notNull().references(() => projects.id),
  filename: varchar('filename', { length: 255 }).notNull(),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  fileSize: int('file_size'),
  mimeType: varchar('mime_type', { length: 100 }),
  note: text('note'),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

export const apiKeys = mysqlTable('api_keys', {
  id: int('id').autoincrement().primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  clientId: varchar('client_id', { length: 100 }).notNull(),
  roleId: int('role_id').notNull().references(() => roles.id),
  status: varchar('status', { length: 20 }).default('active'), // active, inactive
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
});

export const auditLogs = mysqlTable('audit_logs', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').references(() => users.id),
  apiKeyId: int('api_key_id').references(() => apiKeys.id),
  action: varchar('action', { length: 100 }).notNull(),
  module: varchar('module', { length: 100 }).notNull(),
  details: json('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
  agency: one(agencies, { fields: [users.agencyId], references: [agencies.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  fiscalYear: one(fiscalYears, { fields: [projects.fiscalYearId], references: [fiscalYears.id] }),
  quarter: one(quarters, { fields: [projects.quarterId], references: [quarters.id] }),
  category: one(categories, { fields: [projects.categoryId], references: [categories.id] }),
  agency: one(agencies, { fields: [projects.agencyId], references: [agencies.id] }),
  responsible: one(responsiblePersons, { fields: [projects.responsibleId], references: [responsiblePersons.id] }),
  projectStatus: one(projectStatuses, { fields: [projects.statusId], references: [projectStatuses.id] }),
  createdBy: one(users, { fields: [projects.createdById], references: [users.id] }),
  files: many(projectFiles),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  role: one(roles, { fields: [apiKeys.roleId], references: [roles.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
  apiKey: one(apiKeys, { fields: [auditLogs.apiKeyId], references: [apiKeys.id] }),
}));
