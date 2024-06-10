import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { eq, sql } from 'drizzle-orm';

import { Tx, db } from '@/db';
import { files, reports } from '@/db/schema';
import { ErrorSchema } from '@/routes/api-schema';
import { fileToBuffer } from '@/utils';

type InsertFileParams = { file: File; tx: Tx };

async function insertFile({ file, tx }: InsertFileParams) {
  const [item] = await tx
    .insert(files)
    .values({
      content: await fileToBuffer(file),
      name: file.name,
      extension: file.type,
      size: file.size,
    })
    .returning({ id: files.id });

  return item!;
}

const PatchReportSchema = z.object({
  senderName: z
    .string()
    .min(3)
    .max(150)
    .transform((value) => value.trim())
    .optional()
    .openapi({ example: 'John Doe' }),
  senderAge: z.coerce
    .number()
    .positive()
    .max(120)
    .optional()
    .openapi({ example: 42 }),
  file: z
    .instanceof(File)
    .optional()
    .openapi({ description: 'File', type: 'file' as never }),
});

const PatchReportResponseSchema = z
  .object({ id: z.number().openapi({ example: 1 }) })
  .openapi('PatchReportResponse');

const PatchReportParamsSchema = z.object({
  id: z.coerce
    .number()
    .openapi({ type: 'number', param: { name: 'id', in: 'path' }, example: 1 }),
});

const config = createRoute({
  method: 'patch',
  path: '/{id}',
  request: {
    params: PatchReportParamsSchema,
    body: {
      content: { 'multipart/form-data': { schema: PatchReportSchema } },
      description: 'Report content',
    },
  },
  responses: {
    200: {
      description: 'Report',
      content: { 'application/json': { schema: PatchReportResponseSchema } },
    },
    404: {
      description: 'Not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

const patchReportRoute = new OpenAPIHono();

patchReportRoute.openapi(config, async (c) => {
  const values = c.req.valid('form');
  const params = c.req.valid('param');

  const { file } = values;

  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.id, params.id));

  if (!report) {
    return c.json({ message: `Report id=${params.id} not found` }, 404);
  }

  const updatedReport = await db.transaction(async (tx) => {
    const insertedFile = file ? await insertFile({ tx, file }) : null;

    const response = await tx
      .update(reports)
      .set({
        ...values,
        ...(insertedFile && { fileId: insertedFile.id }),
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(reports.id, params.id))
      .returning({ id: reports.id });

    if (insertedFile && report.fileId) {
      await tx.delete(files).where(eq(files.id, report.fileId));
    }

    return { id: response[0]!.id };
  });

  return c.json(updatedReport, 200);
});

export { patchReportRoute };
