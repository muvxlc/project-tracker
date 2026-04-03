import { db } from '../../../utils/db';
import { projectFiles } from '../../../database/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const body = await readBody(event);
  
  if (!id) throw createError({ statusCode: 400, statusMessage: 'File ID is required' });

  await db.update(projectFiles)
    .set({ note: body.note })
    .where(eq(projectFiles.id, id));

  return { success: true };
});
