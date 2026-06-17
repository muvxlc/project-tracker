import { db } from '../../utils/db';
import { fiscalYears, categories, agencies, projectStatuses, quarters, responsiblePersons, budgetSources } from '../../database/schema';
import { eq, desc, asc, sql } from 'drizzle-orm';
import { verifyToken } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const method = event.method;
  const slug = getRouterParam(event, '_') || '';
  const parts = slug.split('/');
  
  const type = parts[0];
  const id = parts[1] ? Number(parts[1]) : null;

  // ตรวจสอบสิทธิ์ (ยกเว้น GET ให้ทุกคนดูได้)
  if (method !== 'GET') {
    const token = getCookie(event, 'token');
    const payload = await verifyToken(token || '');
    if (!payload || (payload.role !== 'superadmin' && payload.role !== 'admin')) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
    }
  }

  // กำหนด Table ที่จะใช้งาน
  let table: any;
  if (type === 'fiscal-years') table = fiscalYears;
  else if (type === 'categories') table = categories;
  else if (type === 'agencies') table = agencies;
  else if (type === 'statuses') table = projectStatuses;
  else if (type === 'quarters') table = quarters;
  else if (type === 'responsible-persons') table = responsiblePersons;
  else if (type === 'budget-sources') table = budgetSources;
  else throw createError({ statusCode: 404, statusMessage: `Resource ${type} not found` });

  // 1. GET - ดึงข้อมูล
  if (method === 'GET') {
    if (type === 'fiscal-years') return await db.select().from(table).orderBy(desc(table.year));
    if (type === 'statuses') return await db.select().from(table).orderBy(asc(table.order));
    if (type === 'responsible-persons') return await db.select().from(table).orderBy(asc(table.name));
    return await db.select().from(table).orderBy(asc(table.name));
  }

  // 2. POST - เพิ่มข้อมูล
  if (method === 'POST') {
    const body = await readBody(event);
    let values: any = {};

    if (type === 'fiscal-years') values = { year: Number(body.year) };
    else if (type === 'categories' || type === 'agencies' || type === 'responsible-persons' || type === 'budget-sources') values = { name: body.name };
    else if (type === 'statuses') {
      let finalOrder = body.order ? Number(body.order) : 0;
      if (!finalOrder) {
        const maxResult = await db.select({ max: sql<number>`MAX(\`order\`)` }).from(projectStatuses);
        finalOrder = (maxResult[0]?.max || 0) + 1;
      }
      values = { name: body.name, color: body.color || 'blue', order: finalOrder };
    } else if (type === 'quarters') {
       throw createError({ statusCode: 405, statusMessage: 'Quarters are read-only' });
    }

    const result = await db.insert(table).values(values);
    return { id: result[0].insertId, ...values };
  }

  // 3. DELETE - ลบข้อมูล
  if (method === 'DELETE' && id) {
    if (type === 'quarters') throw createError({ statusCode: 405, statusMessage: 'Quarters are read-only' });
    await db.delete(table).where(eq(table.id, id));
    return { success: true };
  }

  // 4. PATCH - แก้ไขข้อมูล
  if (method === 'PATCH' && id) {
    const body = await readBody(event);
    let updateValues: any = {};

    if (type === 'fiscal-years') updateValues = { year: Number(body.year) };
    else if (type === 'categories' || type === 'agencies' || type === 'responsible-persons' || type === 'budget-sources') updateValues = { name: body.name };
    else if (type === 'statuses') {
      updateValues = { name: body.name, color: body.color, order: Number(body.order) };
    } else if (type === 'quarters') {
       throw createError({ statusCode: 405, statusMessage: 'Quarters are read-only' });
    }

    await db.update(table).set(updateValues).where(eq(table.id, id));
    return { success: true };
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed or ID missing' });
});
