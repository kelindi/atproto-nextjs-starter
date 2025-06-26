import { getDatabase } from './database'

export type Status = {
  uri: string
  authorDid: string
  status: string
  createdAt: string
  indexedAt: string
}

export interface StatusStore {
  add(status: Status): Promise<void>
  remove(uri: string): Promise<void>
  listLatest(limit: number): Promise<Status[]>
  findLatestForDid(did: string): Promise<Status | undefined>
}

export function createStatusStore(): StatusStore {
  const db = getDatabase()

  return {
    async add(status: Status) {
      try {
        await db
          .insertInto('statuses')
          .values({
            uri: status.uri,
            author_did: status.authorDid,
            status: status.status,
            created_at: status.createdAt,
            indexed_at: status.indexedAt,
          })
          .onConflict((oc) => oc
            .column('uri')
            .doUpdateSet({
              author_did: status.authorDid,
              status: status.status,
              created_at: status.createdAt,
              indexed_at: status.indexedAt,
            })
          )
          .execute()
      } catch (error) {
        console.error('Failed to add status:', error)
        throw error
      }
    },

    async remove(uri: string) {
      try {
        await db
          .deleteFrom('statuses')
          .where('uri', '=', uri)
          .execute()
      } catch (error) {
        console.error('Failed to remove status:', error)
        throw error
      }
    },

    async listLatest(limit: number) {
      try {
        const results = await db
          .selectFrom('statuses')
          .selectAll()
          .orderBy('indexed_at', 'desc')
          .limit(limit)
          .execute()

        return results.map(row => ({
          uri: row.uri,
          authorDid: row.author_did,
          status: row.status,
          createdAt: row.created_at,
          indexedAt: row.indexed_at,
        }))
      } catch (error) {
        console.error('Failed to list latest statuses:', error)
        return []
      }
    },

    async findLatestForDid(did: string) {
      try {
        const result = await db
          .selectFrom('statuses')
          .selectAll()
          .where('author_did', '=', did)
          .orderBy('indexed_at', 'desc')
          .limit(1)
          .executeTakeFirst()

        if (!result) return undefined

        return {
          uri: result.uri,
          authorDid: result.author_did,
          status: result.status,
          createdAt: result.created_at,
          indexedAt: result.indexed_at,
        }
      } catch (error) {
        console.error('Failed to find latest status for DID:', error)
        return undefined
      }
    },
  }
}
