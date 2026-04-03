import { db } from '../../utils/db';
import { projects, projectStatuses } from '../../database/schema';
import { verifyToken } from '../../utils/auth';
import { notifyStatusChange } from '../../utils/notifications';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'token');
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const user = await verifyToken(token);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const body = await readBody(event);
  const {
    name,
    fiscalYearId,
    quarterId,
    categoryId,
    agencyId,
    responsibleId,
    statusId,
    implementationDate,
    completionDate,
    budget,
    description
  } = body;

  const result = await db.insert(projects).values({
    name,
    fiscalYearId: Number(fiscalYearId),
    quarterId: quarterId ? Number(quarterId) : null,
    categoryId: Number(categoryId),
    agencyId: Number(agencyId),
    responsibleId: Number(responsibleId),
    statusId: Number(statusId),
    implementationDate,
    completionDate,
    budget: budget.toString(),
    description,
    createdById: Number(user.id)
  });

  // Send Notification for new project
  try {
    const statusResult = await db.select().from(projectStatuses).where(eq(projectStatuses.id, Number(statusId))).limit(1);
    const statusName = statusResult[0]?.name || 'รอดำเนินการ';
    
    notifyStatusChange(
      name,
      'สร้างโครงการใหม่',
      statusName,
      (user.fullName as string) || (user.username as string)
    ).catch(console.error);
  } catch (e) {
    console.error('Failed to send creation notification:', e);
  }

  return { id: result[0].insertId };
});
