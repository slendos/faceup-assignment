import { sql } from 'drizzle-orm';
import {
  blob,
  index,
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

export const files = sqliteTable('files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: blob('content').notNull(),
  name: text('name').notNull(),
  extension: text('extension').notNull(),
  size: integer('size').notNull(),
  uploadedAt: text('uploaded_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const reports = sqliteTable(
  'reports',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    senderName: text('sender_name').notNull(),
    senderAge: integer('sender_age').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('uploaded_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    fileId: integer('file_id').references(() => files.id, {
      onDelete: 'cascade',
    }),
  },
  (table) => ({ senderNameIdx: index('sender_name_idx').on(table.senderName) }),
);
