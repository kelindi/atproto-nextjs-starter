import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from '@atproto/oauth-client-node'
import { getDatabase, initializeDatabase } from '@/lib/database'

// Initialize database on first import
const db = getDatabase()
initializeDatabase(db).catch(console.error)

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
    try {
      const result = await db
        .selectFrom('sessions')
        .select('data')
        .where('id', '=', key)
        .executeTakeFirst()

      return result ? JSON.parse(result.data) : undefined
    } catch (error) {
      console.error('Failed to get session:', error)
      return undefined
    }
  }

  async set(key: string, val: NodeSavedSession) {
    try {
      const json = JSON.stringify(val)
      
      await db
        .insertInto('sessions')
        .values({
          id: key,
          data: json,
          expires_at: null
        })
        .onConflict((oc) => oc
          .column('id')
          .doUpdateSet({
            data: json,
            expires_at: null
          })
        )
        .execute()
    } catch (error) {
      console.error('Failed to set session:', error)
      throw error
    }
  }

  async del(key: string) {
    try {
      await db
        .deleteFrom('sessions')
        .where('id', '=', key)
        .execute()
    } catch (error) {
      console.error('Failed to delete session:', error)
      throw error
    }
  }
}
