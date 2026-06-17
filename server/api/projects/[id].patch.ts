import { db } from '../../utils/db';
import { projects, projectStatuses } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../../utils/auth';
import { notifyStatusChange } from '../../utils/notifications';

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

  // 1. Fetch current project to check ownership and status change
  const currentProjects = await db.select({
    name: projects.name,
    statusId: projects.statusId,
    createdById: projects.createdById
  }).from(projects).where(eq(projects.id, id)).limit(1);
  
  if (currentProjects.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' });
  }
  const project = currentProjects[0];

  // 2. RBAC check
  const isAdmin = ['superadmin', 'admin', 'approver'].includes(user.role as string);
  const isOwner = project.createdById === Number(user.id);

  if (!isAdmin && !isOwner) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: You cannot edit this project' });
  }

  const newStatusId = Number(body.statusId);
  const statusChanged = project.statusId !== newStatusId;

  // 3. Update
  await db.update(projects).set({
    name: body.name,
    fiscalYearId: Number(body.fiscalYearId),
    quarterId: body.quarterId ? Number(body.quarterId) : null,
    categoryId: Number(body.categoryId),
    agencyId: Number(body.agencyId),
    responsibleId: Number(body.responsibleId),
    budgetSourceId: body.budgetSourceId ? Number(body.budgetSourceId) : null,
    statusId: newStatusId,
    implementationDate: body.implementationDate,
    completionDate: body.completionDate,
    initialBudget: body.initialBudget?.toString() || body.budget?.toString() || '0.00',
    actualBudget: body.actualBudget?.toString() || '0.00',
    budget: body.budget?.toString() || body.initialBudget?.toString() || '0.00',
    description: body.description
  }).where(eq(projects.id, id));

  // 4. Send Notification if status changed
  if (statusChanged) {
    try {
      const statuses = await db.select().from(projectStatuses);
      const oldStatusName = statuses.find(s => s.id === project.statusId)?.name || 'Unknown';
      const newStatusName = statuses.find(s => s.id === newStatusId)?.name || 'Unknown';
      
      // Fire and forget notification
      notifyStatusChange(
        body.name || project.name, 
        oldStatusName, 
        newStatusName, 
        (user.fullName as string) || (user.username as string)
      ).catch(console.error);
    } catch (e) {
      console.error('Failed to send status change notification:', e);
    }
  }

  return { success: true };
});
