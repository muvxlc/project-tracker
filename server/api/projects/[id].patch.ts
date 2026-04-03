import { db } from '../../utils/db';
import { projects } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'token');
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const user = await verifyToken(token);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const id = Number(getRouterParam(event, 'id'));
  const body = await readBody(event);

  // 1. Fetch current project to check ownership
  const currentProject = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (currentProject.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' });
  }

  // 2. RBAC check
  const isAdmin = ['superadmin', 'admin', 'approver'].includes(user.role as string);
  const isOwner = currentProject[0].createdById === Number(user.id);

  if (!isAdmin && !isOwner) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: You cannot edit this project' });
  }

  // 3. Update
  await db.update(projects).set({
    name: body.name,
    fiscalYearId: Number(body.fiscalYearId),
    quarterId: body.quarterId ? Number(body.quarterId) : null,
    categoryId: Number(body.categoryId),
    agencyId: Number(body.agencyId),
    responsibleId: Number(body.responsibleId),
    statusId: Number(body.statusId),
    implementationDate: body.implementationDate,
    completionDate: body.completionDate,
    budget: body.budget.toString(),
    description: body.description
  }).where(eq(projects.id, id));

  return { success: true };
});
