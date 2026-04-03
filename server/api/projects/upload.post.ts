import fs from 'node:fs';
import path from 'node:path';
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

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const results = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const note = notes[i] || '';
    
    // Add timestamp to filename to avoid collisions
    const ext = path.extname(file.filename);
    const basename = path.basename(file.filename, ext);
    const safeFilename = `${basename}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, safeFilename);

    fs.writeFileSync(filePath, file.data);

    const result = await db.insert(projectFiles).values({
      projectId,
      filename: file.filename,
      filePath: `/uploads/${safeFilename}`,
      fileSize: file.data.length,
      mimeType: file.type,
      note: note
    });

    results.push({ id: result[0].insertId, filename: file.filename });
  }

  return { success: true, files: results };
});
