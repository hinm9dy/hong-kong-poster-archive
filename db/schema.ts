import { sqliteTable, text, integer, index, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
export const posters = sqliteTable('posters', {
 id:text('id').primaryKey(), title:text('title').notNull(), designer:text('designer').notNull(), year:integer('year').notNull(), email:text('email').notNull(), objectKey:text('object_key').notNull(), mime:text('mime').notNull(), size:integer('size').notNull(), status:text('status').notNull().default('pending'), createdAt:text('created_at').notNull(), updatedAt:text('updated_at').notNull(), publishedAt:text('published_at'),
}, t => [index('posters_status_year').on(t.status,t.year),check('valid_status',sql`${t.status} in ('pending','selected','published','rejected')`)]);
export const uploadLimits=sqliteTable('upload_limits',{key:text('key').primaryKey(),count:integer('count').notNull(),expiresAt:integer('expires_at').notNull()});
