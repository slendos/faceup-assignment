import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);

export { db };

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
