import { db } from '../../utils/db';
import { projects, agencies, projectStatuses } from '../../database/schema';
import { sql, eq, and, asc, like } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const fiscalYearId = query.fiscalYearId ? Number(query.fiscalYearId) : null;
  const agencyId = query.agencyId ? Number(query.agencyId) : null;
  const categoryId = query.categoryId ? Number(query.categoryId) : null;
  const statusId = query.statusId ? Number(query.statusId) : null;
  const search = query.search as string;

  const conditions = [];
  if (fiscalYearId && !isNaN(fiscalYearId)) conditions.push(eq(projects.fiscalYearId, fiscalYearId));
  if (agencyId && !isNaN(agencyId)) conditions.push(eq(projects.agencyId, agencyId));
  if (categoryId && !isNaN(categoryId)) conditions.push(eq(projects.categoryId, categoryId));
  if (statusId && !isNaN(statusId)) conditions.push(eq(projects.statusId, statusId));
  if (search) conditions.push(like(projects.name, `%${search}%`));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Total budget
  const totalBudget = await db.select({
    sum: sql<string>`sum(budget)`
  }).from(projects)
  .where(whereClause);

  // Status distribution (All statuses from master data)
  const statusStats = await db.select({
    status: projectStatuses.name,
    color: projectStatuses.color,
    order: projectStatuses.order,
    count: sql<number>`count(CASE WHEN ${projects.id} IS NOT NULL THEN 1 END)`
  })
  .from(projectStatuses)
  .leftJoin(projects, and(
    eq(projects.statusId, projectStatuses.id),
    whereClause ? whereClause : sql`1=1`
  ))
  .groupBy(projectStatuses.id, projectStatuses.name, projectStatuses.color, projectStatuses.order)
  .orderBy(asc(projectStatuses.order));

  // Agency distribution
  const agencyStats = await db.select({
    agencyName: agencies.name,
    count: sql<number>`count(*)`
  })
  .from(projects)
  .leftJoin(agencies, eq(projects.agencyId, agencies.id))
  .where(whereClause)
  .groupBy(agencies.name);

  return {
    totalBudget: totalBudget[0]?.sum || '0',
    statusStats,
    agencyStats
  };
});
