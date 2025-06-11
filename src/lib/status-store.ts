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
  let statuses: Status[] = []
  return {
    async add(status: Status) {
      const idx = statuses.findIndex((s) => s.uri === status.uri)
      if (idx !== -1) {
        statuses[idx] = status
      } else {
        statuses.push(status)
      }
    },
    async remove(uri: string) {
      statuses = statuses.filter((s) => s.uri !== uri)
    },
    async listLatest(limit: number) {
      return statuses
        .slice()
        .sort((a, b) => b.indexedAt.localeCompare(a.indexedAt))
        .slice(0, limit)
    },
    async findLatestForDid(did: string) {
      return statuses
        .filter((s) => s.authorDid === did)
        .sort((a, b) => b.indexedAt.localeCompare(a.indexedAt))[0]
    },
  }
}
