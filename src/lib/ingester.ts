import pino from 'pino'
import { IdResolver } from '@atproto/identity'
import { Firehose, type Event } from '@atproto/sync'
import type { StatusStore } from './status-store'
import * as Status from '@/lexicon/types/xyz/statusphere/status'

export function createIngester(statusStore: StatusStore, idResolver: IdResolver) {
  const logger = pino({ name: 'firehose ingestion' })
  return new Firehose({
    idResolver,
    handleEvent: async (evt: Event) => {
      // Watch for write events
      if (evt.event === 'create' || evt.event === 'update') {
        const now = new Date()
        const record = evt.record

        // If the write is a valid status update
        if (
          evt.collection === 'xyz.statusphere.status' &&
          Status.isRecord(record) &&
          Status.validateRecord(record).success
        ) {
          await statusStore.add({
            uri: evt.uri.toString(),
            authorDid: evt.did,
            status: record.status,
            createdAt: record.createdAt,
            indexedAt: now.toISOString(),
          })
        }
      } else if (
        evt.event === 'delete' &&
        evt.collection === 'xyz.statusphere.status'
      ) {
        await statusStore.remove(evt.uri.toString())
      }
    },
    onError: (err: Error) => {
      logger.error({ err }, 'error on firehose ingestion')
    },
    filterCollections: ['xyz.statusphere.status'],
    excludeIdentity: true,
    excludeAccount: true,
  })
}
