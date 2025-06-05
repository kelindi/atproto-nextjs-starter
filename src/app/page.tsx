import HomePage from '@/app/components/HomePage'
import { getContext } from '@/lib/context'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { env } from '@/lib/env'
import { Agent } from '@atproto/api'

export default async function Page() {
  const ctx = await getContext()
  const cookieStore = cookies()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const req = { headers: { cookie: cookieStore.toString() } } as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = {} as any
  const session = await getIronSession<{ did?: string }>(req, res, {
    cookieName: 'sid',
    password: env.COOKIE_SECRET,
  })
  const agent = session.did
    ? await ctx.oauthClient
        .restore(session.did)
        .then((sess) => (sess ? new Agent(sess) : null))
        .catch(async (err) => {
          ctx.logger.warn({ err }, 'oauth restore failed')
          await session.destroy()
          return null
        })
    : null

  const statuses = await ctx.db
    .selectFrom('status')
    .selectAll()
    .orderBy('indexedAt', 'desc')
    .limit(10)
    .execute()

  const myStatus = agent
    ? await ctx.db
        .selectFrom('status')
        .selectAll()
        .where('authorDid', '=', agent.assertDid)
        .orderBy('indexedAt', 'desc')
        .executeTakeFirst()
    : undefined

  const didHandleMap = await ctx.resolver.resolveDidsToHandles(
    statuses.map((s) => s.authorDid)
  )

  let profile: { displayName?: string } | undefined
  if (agent) {
    const profileRes = await agent.com.atproto.repo
      .getRecord({
        repo: agent.assertDid,
        collection: 'app.bsky.actor.profile',
        rkey: 'self',
      })
      .catch(() => undefined)
    const record = profileRes?.data
    if (record && record.value && typeof record.value === 'object') {
      profile = { displayName: ((record.value as {displayName?: string}).displayName) }
    }
  }

  return (
    <HomePage
      statuses={statuses}
      didHandleMap={didHandleMap}
      profile={profile}
      myStatus={myStatus}
    />
  )
}
