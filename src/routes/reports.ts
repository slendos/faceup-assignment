import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { like } from 'drizzle-orm';

import { db } from '@/db';
import { reports } from '@/db/schema';

import { ReportSchema } from './api-schema';

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
    .where(senderName ? like(reports.senderName, `%${senderName}%`) : undefined)
    .limit(20);

  return c.json(items);
});

export { reportsRoute };
