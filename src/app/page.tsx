import HomePage from '@/app/components/HomePage'
import { getContext } from '@/lib/context'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'
import { Agent } from '@atproto/api'

export default async function Page() {
  const ctx = await getContext()
  const cookieStore = await cookies()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const req = { headers: { cookie: cookieStore.toString() } } as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = {} as any
  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  
  const agent = session.did
    ? await ctx.oauthClient
        .restore(session.did)
        .then((sess) => (sess ? new Agent(sess) : null))
        .catch((err) => {
          ctx.logger.warn({ err }, 'oauth restore failed')
          // Cannot destroy session in a server component, just return null
          return null
        })
    : null

  const statuses = await ctx.statusStore.listLatest(10)

  const myStatus = agent
    ? await ctx.statusStore.findLatestForDid(agent.assertDid)
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
      currentUserDid={agent?.assertDid}
    />
  )
}
