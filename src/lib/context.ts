import pino from 'pino'
import type { OAuthClient } from '@atproto/oauth-client-node'
import { Firehose } from '@atproto/sync'
import { createDb, migrateToLatest, type Database } from './db'
import { createBidirectionalResolver, createIdResolver, type BidirectionalResolver } from './id-resolver'
import { createIngester } from './ingester'
import { createClient } from '../auth/client'
import { env } from './env'

export type AppContext = {
  db: Database
  ingester: Firehose
  logger: pino.Logger
  oauthClient: OAuthClient
  resolver: BidirectionalResolver
}

let ctx: Promise<AppContext> | null = null

async function createContext(): Promise<AppContext> {
  const logger = pino({ name: 'nextjs-app' })
  const db = createDb(env.DB_PATH)
  await migrateToLatest(db)
  const oauthClient = await createClient(db)
  const baseIdResolver = createIdResolver()
  const ingester = createIngester(db, baseIdResolver)
  const resolver = createBidirectionalResolver(baseIdResolver)
  ingester.start()
  return { db, ingester, logger, oauthClient, resolver }
}

export async function getContext(): Promise<AppContext> {
  if (!ctx) ctx = createContext()
  return ctx
}
