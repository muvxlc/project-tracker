import fs from 'node:fs';
import path from 'node:path';
import { db } from '../../../utils/db';
import { projectFiles } from '../../../database/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (!id) throw createError({ statusCode: 400, statusMessage: 'File ID is required' });

  // 1. Get file info to delete physical file
  const files = await db.select().from(projectFiles).where(eq(projectFiles.id, id)).limit(1);
  const file = files[0];

  if (!file) {
    throw createError({ statusCode: 404, statusMessage: 'File not found' });
  }

  // 2. Delete from database
  await db.delete(projectFiles).where(eq(projectFiles.id, id));

  // 3. Delete from storage
  try {
    const physicalPath = path.join(process.cwd(), 'storage', 'uploads', file.filePath);
    if (fs.existsSync(physicalPath)) {
      fs.unlinkSync(physicalPath);
    }
  } catch (e) {
    console.error('Failed to delete physical file:', e);
  }

  return { success: true };
});
