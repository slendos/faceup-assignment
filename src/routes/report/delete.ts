import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { files, reports } from '@/db/schema';
import { ErrorSchema } from '@/routes/api-schema';

const DeleteReportResponseSchema = z
  .object({ message: z.string() })
  .openapi('DeleteReportResponse');

const DeleteReportParamsSchema = z.object({
  id: z.coerce
    .number()
    .openapi({ type: 'number', param: { name: 'id', in: 'path' }, example: 1 }),
});

const config = createRoute({
  method: 'delete',
  path: '/{id}',
  request: { params: DeleteReportParamsSchema },
  responses: {
    200: {
      description: 'Report',
      content: { 'application/json': { schema: DeleteReportResponseSchema } },
    },
    404: {
      description: 'Report',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

const deleteReportRoute = new OpenAPIHono();

deleteReportRoute.openapi(config, async (c) => {
  const params = c.req.valid('param');

  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.id, params.id));

  if (!report) {
    return c.json({ message: `Report id=${params.id} not found` }, 404);
  }

  await db.transaction(async (tx) => {
    await tx.delete(reports).where(eq(reports.id, params.id));

    if (report.fileId) {
      await tx.delete(files).where(eq(files.id, report.fileId));
    }
  });

  return c.json({ message: `Report id=${params.id} deleted` }, 200);
});

export { deleteReportRoute };
