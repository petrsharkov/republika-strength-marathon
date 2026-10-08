import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const participants = sqliteTable('participants', {
 id: text('id').primaryKey(), lastName: text('last_name').notNull().default(''), firstName: text('first_name').notNull().default(''), phone: text('phone').notNull().default(''), registrationKey: text('registration_key'), source: text('source').notNull().default('manual'), bodyWeight: real('body_weight'), barWeight: real('bar_weight'), bench: integer('bench'), pullups: integer('pullups'), dips: integer('dips'), swimSeconds: real('swim_seconds'), createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull(), fieldTimes: text('field_times').notNull().default('{}'),
}, t => [uniqueIndex('idx_participants_registration_key').on(t.registrationKey)]);
export const sessions = sqliteTable('admin_sessions', { tokenHash: text('token_hash').primaryKey(), expiresAt: integer('expires_at').notNull() });
export const attempts = sqliteTable('login_attempts', { key: text('key').primaryKey(), count: integer('count').notNull(), resetAt: integer('reset_at').notNull() });
