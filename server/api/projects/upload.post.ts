import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { db } from '../../utils/db';
import { projectFiles } from '../../database/schema';

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'No files uploaded' });
  }

  let projectId: number | null = null;
  const files: { filename: string, data: Buffer, type: string | undefined }[] = [];
  const notes: string[] = [];

  for (const part of formData) {
    if (part.name === 'projectId') {
      projectId = Number(part.data.toString());
    } else if (part.name === 'files') {
      if (part.filename && part.data) {
        files.push({
          filename: part.filename,
          data: part.data,
          type: part.type
        });
      }
    } else if (part.name === 'notes') {
      notes.push(part.data.toString());
    }
  }

  if (!projectId || files.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Project ID and files are required' });
  }

  // 1. New Private Storage Path
  // Using 'storage/uploads/projects/[id]' structure
  const projectUploadDir = path.join(process.cwd(), 'storage', 'uploads', 'projects', projectId.toString());
  if (!fs.existsSync(projectUploadDir)) {
    fs.mkdirSync(projectUploadDir, { recursive: true });
  }

  const results = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const note = notes[i] || '';
    
    // 2. Use UUID for physical filename to prevent collisions and improve security
    const ext = path.extname(file.filename);
    const secureFilename = `${randomUUID()}${ext}`;
    const physicalPath = path.join(projectUploadDir, secureFilename);

    // 3. Save physical file
    fs.writeFileSync(physicalPath, file.data);

    // 4. Save relative path in DB
    // Format: projects/[projectId]/[secureFilename]
    const relativePath = path.join('projects', projectId.toString(), secureFilename);
    const fileUuid = randomUUID();

    const result = await db.insert(projectFiles).values({
      projectId,
      uuid: fileUuid,
      filename: file.filename, // Keep original name for display
      filePath: relativePath,
      fileSize: file.data.length,
      mimeType: file.type,
      note: note
    });

    results.push({ id: result[0].insertId, filename: file.filename });
  }

  return { success: true, files: results };
});
