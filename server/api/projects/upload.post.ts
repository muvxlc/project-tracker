import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { db } from '../../utils/db';
import { projectFiles } from '../../database/schema';

// Helper to check File Signatures (Magic Numbers)
const isAllowedFileType = (buffer: Buffer, filename: string) => {
  const ext = path.extname(filename).toLowerCase();
  const header = buffer.toString('hex', 0, 4).toUpperCase();

  // PDF: %PDF- (25504446)
  if (ext === '.pdf') return header === '25504446';
  
  // Images: JPG (FFD8FF), PNG (89504E47)
  if (ext === '.jpg' || ext === '.jpeg') return header.startsWith('FFD8FF');
  if (ext === '.png') return header === '89504E47';
  
  // Office Docs (ZIP based): DOCX, XLSX (504B0304)
  if (ext === '.docx' || ext === '.xlsx') return header === '504B0304';
  
  // Older Office Docs: .doc, .xls (D0CF11E0)
  if (ext === '.doc' || ext === '.xls') return header === 'D0CF11E0';

  return false;
};

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
        // 1. Check File Size (e.g., 30MB limit)
        if (part.data.length > 30 * 1024 * 1024) {
          throw createError({ statusCode: 400, statusMessage: `File ${part.filename} is too large (>30MB)` });
        }

        // 2. Validate File Content (Magic Numbers) - TASK 2
        if (!isAllowedFileType(part.data, part.filename)) {
          throw createError({ statusCode: 400, statusMessage: `File ${part.filename} has invalid or disallowed content type.` });
        }

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

  const projectUploadDir = path.join(process.cwd(), 'storage', 'uploads', 'projects', projectId.toString());
  if (!fs.existsSync(projectUploadDir)) {
    fs.mkdirSync(projectUploadDir, { recursive: true });
  }

  const results = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const note = notes[i] || '';
    
    const ext = path.extname(file.filename);
    const secureFilename = `${randomUUID()}${ext}`;
    const physicalPath = path.join(projectUploadDir, secureFilename);

    // 3. Save physical file with NO EXECUTE permissions (0644) - TASK 1
    fs.writeFileSync(physicalPath, file.data, { mode: 0o644 });

    const relativePath = path.join('projects', projectId.toString(), secureFilename);
    const fileUuid = randomUUID();

    const result = await db.insert(projectFiles).values({
      projectId,
      uuid: fileUuid,
      filename: file.filename,
      filePath: relativePath,
      fileSize: file.data.length,
      mimeType: file.type,
      note: note
    });

    results.push({ id: result[0].insertId, filename: file.filename });
  }

  return { success: true, files: results };
});
