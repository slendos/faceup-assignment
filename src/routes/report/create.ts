import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { db } from '@/db';
import { files, reports } from '@/db/schema';
import { fileToBuffer } from '@/utils';

const CreateReportSchema = z.object({
  senderName: z
    .string()
    .min(3)
    .max(150)
    .transform((value) => value.trim())
    .openapi({ example: 'John Doe' }),
  senderAge: z.coerce.number().positive().max(120).openapi({ example: 42 }),
  file: z
    .instanceof(File)
    .optional()
    .openapi({ description: 'File', type: 'file' as never }),
});

const CreateReportResponseSchema = z
  .object({ id: z.number().openapi({ example: 1 }) })
  .openapi('CreateReportResponse');

const config = createRoute({
  method: 'post',
  path: '',
  request: {
    body: {
      content: { 'multipart/form-data': { schema: CreateReportSchema } },
      description: 'Report content',
    },
  },
  responses: {
    201: {
      description: 'Report',
      content: { 'application/json': { schema: CreateReportResponseSchema } },
    },
  },
});

const createReportRoute = new OpenAPIHono();

createReportRoute.openapi(config, async (c) => {
  const values = c.req.valid('form');

  const { file } = values;

  const createdReport = await db.transaction(async (tx) => {
    const [insertedFile] = file
      ? await tx
          .insert(files)
          .values({
            content: await fileToBuffer(file),
            name: file.name,
            extension: file.type,
            size: file.size,
          })
          .returning({ id: files.id })
      : [];

    const [insertedReport] = await tx
      .insert(reports)
      .values({
        ...(insertedFile && { fileId: insertedFile.id }),
        senderName: values.senderName,
        senderAge: values.senderAge,
      })
      .returning({ id: reports.id });

    return insertedReport!;
  });

  return c.json(createdReport, 201);
});

export { createReportRoute };
