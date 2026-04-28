import { db } from '../../utils/db';
import { projects, fiscalYears, categories, agencies, projectStatuses, quarters, responsiblePersons, budgetSources } from '../../database/schema';
import { eq, and, like } from 'drizzle-orm';
import ExcelJS from 'exceljs';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  
  // 1. ดึงข้อมูลโครงการตาม Filters เดียวกับหน้า Dashboard
  const fiscalYearId = query.fiscalYearId ? Number(query.fiscalYearId) : null;
  const quarterId = query.quarterId ? Number(query.quarterId) : null;
  const agencyId = query.agencyId ? Number(query.agencyId) : null;
  const categoryId = query.categoryId ? Number(query.categoryId) : null;
  const statusId = query.statusId ? Number(query.statusId) : null;
  const search = query.search as string;

  const conditions = [];
  if (fiscalYearId) conditions.push(eq(projects.fiscalYearId, fiscalYearId));
  if (quarterId) conditions.push(eq(projects.quarterId, quarterId));
  if (agencyId) conditions.push(eq(projects.agencyId, agencyId));
  if (categoryId) conditions.push(eq(projects.categoryId, categoryId));
  if (statusId) conditions.push(eq(projects.statusId, statusId));
  if (search) conditions.push(like(projects.name, `%${search}%`));

  const projectList = await db.select({
    fiscalYear: fiscalYears.year,
    category: categories.name,
    name: projects.name,
    quarterName: quarters.name,
    initialBudget: projects.initialBudget,
    actualBudget: projects.actualBudget,
    agency: agencies.name,
    responsible: responsiblePersons.name,
    budgetSource: budgetSources.name,
    implementationDate: projects.implementationDate,
    completionDate: projects.completionDate,
    status: projectStatuses.name,
    description: projects.description
  })
  .from(projects)
  .leftJoin(fiscalYears, eq(projects.fiscalYearId, fiscalYears.id))
  .leftJoin(quarters, eq(projects.quarterId, quarters.id))
  .leftJoin(categories, eq(projects.categoryId, categories.id))
  .leftJoin(agencies, eq(projects.agencyId, agencies.id))
  .leftJoin(responsiblePersons, eq(projects.responsibleId, responsiblePersons.id))
  .leftJoin(budgetSources, eq(projects.budgetSourceId, budgetSources.id))
  .leftJoin(projectStatuses, eq(projects.statusId, projectStatuses.id))
  .where(conditions.length > 0 ? and(...conditions) : undefined);

  // 2. สร้างไฟล์ Excel ด้วย ExcelJS
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('รายงานโครงการ');

  // ตั้งค่าหัวตาราง
  const columns = [
    { header: 'ปีงบประมาณ', key: 'fiscalYear', width: 15 },
    { header: 'ประเภท', key: 'category', width: 15 },
    { header: 'ชื่อโครงการ', key: 'name', width: 60 }, // Fixed width for wrapping
    { header: 'ไตรมาส', key: 'quarterName', width: 12 },
    { header: 'งบประมาณตั้งต้น', key: 'initialBudget', width: 20 },
    { header: 'งบประมาณที่ใช้จริง', key: 'actualBudget', width: 20 },
    { header: 'กลุ่มงาน', key: 'agency', width: 20 },
    { header: 'ผู้รับผิดชอบ', key: 'responsible', width: 25 },
    { header: 'แหล่งที่มาของงบประมาณ', key: 'budgetSource', width: 25 },
    { header: 'วันที่ดำเนินการ', key: 'implementationDate', width: 18 },
    { header: 'วันที่เสร็จสิ้นโครงการ', key: 'completionDate', width: 18 },
    { header: 'สถานะปัจจุบัน', key: 'status', width: 15 },
    { header: 'รายละเอียดเพิ่มเติม', key: 'description', width: 60 } // Fixed width for wrapping
  ];
  worksheet.columns = columns;

  // เพิ่มข้อมูล
  projectList.forEach(p => {
    worksheet.addRow({
      ...p,
      initialBudget: Number(p.initialBudget || 0),
      actualBudget: Number(p.actualBudget || 0),
      implementationDate: p.implementationDate ? new Date(p.implementationDate).toLocaleDateString('th-TH') : '-',
      completionDate: p.completionDate ? new Date(p.completionDate).toLocaleDateString('th-TH') : '-',
      budgetSource: p.budgetSource || '-',
      description: p.description || '-'
    });
  });

  // Dynamic Auto-fit for most columns, except name and description
  worksheet.columns.forEach((column: any) => {
    if (column.key !== 'name' && column.key !== 'description') {
      let maxColumnLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        // Handle Thai character width (Thai chars are visually wider in Excel)
        const cellValue = cell.value ? cell.value.toString() : '';
        const columnLength = cellValue.length + (cellValue.match(/[ก-ฮะ-าเ-โ]/g) || []).length * 0.5;
        if (columnLength > maxColumnLength) {
          maxColumnLength = columnLength;
        }
      });
      // Set width with padding
      column.width = maxColumnLength < 12 ? 12 : maxColumnLength + 5;
    }
  });

  // จัดรูปแบบ (Styles)
  const headerRow = worksheet.getRow(1);
  headerRow.font = { name: 'Angsana New', size: 16, bold: true };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet.eachRow((row, rowNumber) => {
    row.font = { name: 'Angsana New', size: 16 };
    row.eachCell((cell) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      if (rowNumber > 1) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }
    });
    
    if (rowNumber > 1) {
      row.getCell('initialBudget').numFmt = '#,##0.00';
      row.getCell('actualBudget').numFmt = '#,##0.00';
      row.getCell('fiscalYear').alignment = { horizontal: 'center' };
      row.getCell('quarterName').alignment = { horizontal: 'center' };
      row.getCell('status').alignment = { horizontal: 'center' };
    }
  });

  // 3. ส่งไฟล์กลับ
  const buffer = await workbook.xlsx.writeBuffer();
  
  appendHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  appendHeader(event, 'Content-Disposition', `attachment; filename="project_report_${Date.now()}.xlsx"`);

  return buffer;
});
