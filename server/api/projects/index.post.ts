import { db } from '../../utils/db';
import { projects } from '../../database/schema';
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

  return { id: result[0].insertId };
});
