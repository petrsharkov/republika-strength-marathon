import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

let database: DatabaseSync | undefined;
function open() {
  if (database) return database;
  const path = process.env.DATABASE_PATH || '/data/marathon.sqlite';
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
  db.exec('CREATE TABLE IF NOT EXISTS _server_migrations (name TEXT PRIMARY KEY)');
  const journal = JSON.parse(readFileSync(resolve('drizzle/meta/_journal.json'), 'utf8')) as { entries: { tag: string }[] };
  try {
    for (const { tag } of journal.entries) {
      if (db.prepare('SELECT name FROM _server_migrations WHERE name = ?').get(tag)) continue;
      const sql = readFileSync(resolve('drizzle', `${tag}.sql`), 'utf8');
      db.exec('BEGIN IMMEDIATE');
      try {
        db.exec(sql);
        db.prepare('INSERT INTO _server_migrations VALUES (?)').run(tag);
        db.exec('COMMIT');
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    }
    database = db;
    return db;
  } catch (error) { db.close(); throw error; }
}

class Statement {
  constructor(private sql: string, private values: SQLInputValue[] = []) {}
  bind(...values: SQLInputValue[]) { return new Statement(this.sql, values); }
  async first() { return open().prepare(this.sql).get(...this.values) ?? null; }
  async all() { return { results: open().prepare(this.sql).all(...this.values), success: true }; }
  execute() {
    const result = open().prepare(this.sql).run(...this.values);
    return { success: true, meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) } };
  }
  async run() { return this.execute(); }
}

// Implements the D1 subset used by this application's existing API routes.
export function getRawDb(): D1Database {
  return {
    prepare(sql: string) { return new Statement(sql); },
    async batch(statements: Statement[]) {
      const db = open();
      db.exec('BEGIN IMMEDIATE');
      try {
        const results = statements.map(statement => statement.execute());
        db.exec('COMMIT');
        return results;
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
  } as unknown as D1Database;
}
