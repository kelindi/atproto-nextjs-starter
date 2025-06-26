import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from '@atproto/oauth-client-node'

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

let db: any;
let isPostgres = false;

if (dbUrl.startsWith('postgres')) {
  // Postgres
  const { Pool } = require('pg');
  db = new Pool({ connectionString: dbUrl });
  isPostgres = true;
} else {
  // SQLite
  const Database = require('better-sqlite3');
  db = new Database(dbUrl.replace('file:', ''));
}

// Ensure sessions table exists
const createTableSql = `CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  expires_at TIMESTAMP
);`;
if (isPostgres) {
  db.query(createTableSql).catch(() => {});
} else {
  db.prepare(createTableSql).run();
}

export class StateStore implements NodeSavedStateStore {
  private store = new Map<string, NodeSavedState>();
  async get(key: string): Promise<NodeSavedState | undefined> {
    return this.store.get(key);
  }
  async set(key: string, val: NodeSavedState) {
    this.store.set(key, val);
  }
  async del(key: string) {
    this.store.delete(key);
  }
}

export class SessionStore implements NodeSavedSessionStore {
  async get(key: string): Promise<NodeSavedSession | undefined> {
    if (isPostgres) {
      const res = await db.query('SELECT data FROM sessions WHERE id = $1', [key]);
      return res.rows[0] ? JSON.parse(res.rows[0].data) : undefined;
    } else {
      const row = db.prepare('SELECT data FROM sessions WHERE id = ?').get(key);
      return row ? JSON.parse(row.data) : undefined;
    }
  }
  async set(key: string, val: NodeSavedSession) {
    const json = JSON.stringify(val);
    if (isPostgres) {
      await db.query(
        'INSERT INTO sessions (id, data, expires_at) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET data = $2, expires_at = $3',
        [key, json, null]
      );
    } else {
      db.prepare(
        'INSERT OR REPLACE INTO sessions (id, data, expires_at) VALUES (?, ?, ?)' 
      ).run(key, json, null);
    }
  }
  async del(key: string) {
    if (isPostgres) {
      await db.query('DELETE FROM sessions WHERE id = $1', [key]);
    } else {
      db.prepare('DELETE FROM sessions WHERE id = ?').run(key);
    }
  }
}
