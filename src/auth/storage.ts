import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from '@atproto/oauth-client-node'

export class StateStore implements NodeSavedStateStore {
  private store = new Map<string, NodeSavedState>()
  async get(key: string): Promise<NodeSavedState | undefined> {
    return this.store.get(key)
  }
  async set(key: string, val: NodeSavedState) {
    this.store.set(key, val)
  }
  async del(key: string) {
    this.store.delete(key)
  }
}

export class SessionStore implements NodeSavedSessionStore {
  private store = new Map<string, NodeSavedSession>()
  async get(key: string): Promise<NodeSavedSession | undefined> {
    return this.store.get(key)
  }
  async set(key: string, val: NodeSavedSession) {
    this.store.set(key, val)
  }
  async del(key: string) {
    this.store.delete(key)
  }
}
