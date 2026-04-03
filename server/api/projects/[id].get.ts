import { db } from '../../utils/db';
import { projects, projectFiles } from '../../database/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID is required' });

  console.log(`[API] Fetching project data for ID: ${id}`);

  // 1. Fetch main project data
  const projectList = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  const project = projectList[0];

  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' });
  }

  // 2. Fetch associated files
  const files = await db.select().from(projectFiles).where(eq(projectFiles.projectId, id));

  return {
    ...project,
    files: files || []
  };
});
