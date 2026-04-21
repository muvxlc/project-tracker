import { db } from '../../utils/db';
import { projects, fiscalYears, categories, agencies, users, projectStatuses, quarters, responsiblePersons, budgetSources } from '../../database/schema';
import { eq, and, like } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  console.log('[API] Fetching projects with filters:', query);

  const fiscalYearId = query.fiscalYearId ? Number(query.fiscalYearId) : null;
  const agencyId = query.agencyId ? Number(query.agencyId) : null;
  const categoryId = query.categoryId ? Number(query.categoryId) : null;
  const statusId = query.statusId ? Number(query.statusId) : null;
  const search = query.search as string;

  const conditions = [];
  if (fiscalYearId && !isNaN(fiscalYearId)) {
    conditions.push(eq(projects.fiscalYearId, fiscalYearId));
  }
  if (agencyId && !isNaN(agencyId)) {
    conditions.push(eq(projects.agencyId, agencyId));
  }
  if (categoryId && !isNaN(categoryId)) {
    conditions.push(eq(projects.categoryId, categoryId));
  }
  if (statusId && !isNaN(statusId)) {
    conditions.push(eq(projects.statusId, statusId));
  }
  if (search) {
    conditions.push(like(projects.name, `%${search}%`));
  }

  console.log(`[API] Conditions count: ${conditions.length}`);

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const projectList = await db.select({
    id: projects.id,
    name: projects.name,
    budget: projects.budget,
    initialBudget: projects.initialBudget,
    actualBudget: projects.actualBudget,
    implementationDate: projects.implementationDate,
    fiscalYear: fiscalYears.year,
    quarterName: quarters.name,
    category: categories.name,
    agency: agencies.name,
    responsible: responsiblePersons.name,
    budgetSource: budgetSources.name,
    status: projectStatuses.name,
    statusColor: projectStatuses.color,
    createdById: projects.createdById
  })
  .from(projects)
  .leftJoin(fiscalYears, eq(projects.fiscalYearId, fiscalYears.id))
  .leftJoin(quarters, eq(projects.quarterId, quarters.id))
  .leftJoin(categories, eq(projects.categoryId, categories.id))
  .leftJoin(agencies, eq(projects.agencyId, agencies.id))
  .leftJoin(responsiblePersons, eq(projects.responsibleId, responsiblePersons.id))
  .leftJoin(budgetSources, eq(projects.budgetSourceId, budgetSources.id))
  .leftJoin(projectStatuses, eq(projects.statusId, projectStatuses.id))
  .where(whereClause);

  return projectList;
});
