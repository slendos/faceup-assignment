import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { reports } from '@/db/schema';
import { ErrorSchema, ReportSchema } from '@/routes/api-schema';

const GetReportParamsSchema = z.object({
  id: z.coerce
    .number()
    .openapi({ type: 'number', param: { name: 'id', in: 'path' }, example: 1 }),
});

export const config = createRoute({
  method: 'get',
  path: `/{id}`,
  request: { params: GetReportParamsSchema },
  responses: {
    200: {
      description: 'Report items',
      content: { 'application/json': { schema: ReportSchema } },
    },
    404: {
      description: 'Not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

const getReportRoute = new OpenAPIHono();

getReportRoute.openapi(config, async (c) => {
  const { id } = c.req.valid('param');

  const [item] = await db
    .select({
      id: reports.id,
      senderName: reports.senderName,
      senderAge: reports.senderAge,
      fileId: reports.fileId,
    })
    .from(reports)
    .where(eq(reports.id, id));

  if (!item) {
    return c.json({ message: `Report id=${id} not found` }, 404);
  }

  return c.json(item, 200);
});

export { getReportRoute };
