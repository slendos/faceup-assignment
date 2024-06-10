import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { files } from '@/db/schema';

import { ErrorSchema } from './api-schema';

const fileRoute = new OpenAPIHono();

const FileParamsSchema = z.object({
  id: z.coerce
    .number()
    .openapi({ type: 'number', param: { name: 'id', in: 'path' }, example: 1 }),
});

export const getFileRoute = createRoute({
  method: 'get',
  path: '/{id}',
  request: { params: FileParamsSchema },
  responses: {
    200: {
      description: 'File',
      content: { 'application/octet-stream': { schema: { format: 'binary' } } },
    },
    404: {
      description: '404 Not Found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

fileRoute.openapi(getFileRoute, async (c) => {
  const { id } = c.req.valid('param');

  const [file] = await db.select().from(files).where(eq(files.id, id));

  if (!file) {
    return c.json({ message: `File id="${id}" not found` }, 404);
  }

  return c.body(file.content as Buffer, 200, {
    'Content-Disposition': `attachment; filename="${file.name}"`,
    'Content-Type': file.extension,
  }) as never;
});

export { fileRoute };
