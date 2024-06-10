import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { ilike, like } from 'drizzle-orm';

import { db } from '@/db';
import { reports } from '@/db/schema';

const ReportSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    senderName: z.string().openapi({ example: 'John Doe' }),
    senderAge: z.number().openapi({ example: 42 }),
    fileId: z.number().nullable().openapi({ example: 1 }),
  })
  .openapi('Report');

const ReportsSchema = z.array(ReportSchema);

const reportsRoute = new OpenAPIHono();

export const getReportsRoute = createRoute({
  method: 'get',
  path: '/',
  request: { query: z.object({ senderName: z.string().optional() }) },
  responses: {
    200: {
      description: 'Report items',
      content: { 'application/json': { schema: ReportsSchema } },
    },
  },
});

reportsRoute.openapi(getReportsRoute, async (c) => {
  const { senderName } = c.req.valid('query');

  const items = await db
    .select({
      id: reports.id,
      senderName: reports.senderName,
      senderAge: reports.senderAge,
      fileId: reports.fileId,
    })
    .from(reports)
    .where(
      senderName ? like(reports.senderName, `%${senderName}%`) : undefined,
    );

  return c.json(items);
});

export { reportsRoute };
