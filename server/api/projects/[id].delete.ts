import { db } from '../../utils/db';
import { projects, projectFiles } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../../utils/auth';
import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' });
  }

  // Check permissions (Superadmin/Admin only)
  const token = getCookie(event, 'token');
  const payload = await verifyToken(token || '');
  if (!payload || (payload.role !== 'superadmin' && payload.role !== 'admin')) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }

  // 1. Get associated files to delete from disk
  const files = await db.select().from(projectFiles).where(eq(projectFiles.projectId, id));
  
  for (const file of files) {
    const fullPath = path.resolve(process.cwd(), 'public', file.filePath.replace(/^\//, ''));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  // 2. Delete file records from DB
  await db.delete(projectFiles).where(eq(projectFiles.projectId, id));

  // 3. Delete the project
  const result = await db.delete(projects).where(eq(projects.id, id));

  return { success: true, deletedId: id };
});
