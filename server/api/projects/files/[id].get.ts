import fs from 'node:fs';
import path from 'node:path';
import { db } from '../../../utils/db';
import { projectFiles, projects } from '../../../database/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  // 1. Authenticate user
  const token = getCookie(event, 'token');
  const user = await verifyToken(token || '');
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  // 2. Get file info
  const identifier = getRouterParam(event, 'id');
  const isUuid = identifier?.length === 36;
  
  let fileResult;
  if (isUuid) {
    fileResult = await db.select().from(projectFiles).where(eq(projectFiles.uuid, identifier as string)).limit(1);
  } else {
    fileResult = await db.select().from(projectFiles).where(eq(projectFiles.id, Number(identifier))).limit(1);
  }
  
  const file = fileResult[0];

  if (!file) {
    throw createError({ statusCode: 404, statusMessage: 'File not found' });
  }

  // 3. Enforce Access Control (RBAC)
  const projectResult = await db.select().from(projects).where(eq(projects.id, file.projectId)).limit(1);
  const project = projectResult[0];

  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Associated project not found' });
  }

  const isAdmin = ['superadmin', 'admin', 'approver'].includes(user.role as string);
  const isOwner = project.createdById === Number(user.id);

  if (!isAdmin && !isOwner) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: You do not have permission to view this file' });
  }

  // 4. Resolve and Validate physical path (Path Traversal Protection) - TASK 5
  const rootDir = path.join(process.cwd(), 'storage', 'uploads');
  // path.resolve helps clean up any ../ in the relative path
  const physicalPath = path.resolve(rootDir, file.filePath);

  // Check if the resolved path is still inside rootDir
  if (!physicalPath.startsWith(rootDir)) {
    console.error(`[SECURITY] Potential path traversal attempt! User: ${user.username}, Path: ${file.filePath}`);
    throw createError({ statusCode: 400, statusMessage: 'Invalid file path' });
  }

  if (!fs.existsSync(physicalPath)) {
    throw createError({ statusCode: 404, statusMessage: 'Physical file not found' });
  }

  // 5. Send file with security headers - TASK 1
  const fileBuffer = fs.readFileSync(physicalPath);
  
  setHeaders(event, {
    'Content-Type': file.mimeType || 'application/octet-stream',
    'Content-Disposition': `inline; filename="${encodeURIComponent(file.filename)}"`,
    'X-Content-Type-Options': 'nosniff', // Prevent MIME sniffing
    'Cache-Control': 'private, max-age=3600'
  });

  return fileBuffer;
});
