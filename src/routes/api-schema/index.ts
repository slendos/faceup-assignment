import { z } from '@hono/zod-openapi';

export const ErrorSchema = z.object({
  message: z.string().openapi({ example: 'Something went wrong' }),
});

export const ReportSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    senderName: z.string().openapi({ example: 'John Doe' }),
    senderAge: z.number().openapi({ example: 42 }),
    fileId: z.number().nullable().openapi({ example: 1 }),
  })
  .openapi('Report');
