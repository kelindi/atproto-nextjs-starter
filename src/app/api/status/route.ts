import { getContext } from '@/lib/context'
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { env } from '@/lib/env'
import { TID } from '@atproto/common'
import * as Status from '@/lexicon/types/xyz/statusphere/status'
import { Agent } from '@atproto/api'

export async function POST(req: NextRequest) {
  const ctx = await getContext()
  const res = NextResponse.redirect(new URL('/', req.url))
  const session = await getIronSession<{ did?: string }>(req, res, {
    cookieName: 'sid',
    password: env.COOKIE_SECRET,
  })
  if (!session.did) {
    return NextResponse.json({ error: 'session required' }, { status: 401 })
  }
  const body = await req.formData()
  const status = body.get('status')
  const agentSession = await ctx.oauthClient.restore(session.did)
  if (!agentSession) return NextResponse.json({ error: 'no session' }, { status: 401 })
  const agent = new Agent(agentSession)
  const rkey = TID.nextStr()
  const record = {
    $type: 'xyz.statusphere.status',
    status,
    createdAt: new Date().toISOString(),
  }
  if (!Status.validateRecord(record).success) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 })
  }
  let uri: string
  try {
    const put = await agent.com.atproto.repo.putRecord({
      repo: agent.assertDid,
      collection: 'xyz.statusphere.status',
      rkey,
      record,
      validate: false,
    })
    uri = put.data.uri
  } catch (err) {
    ctx.logger.warn({ err }, 'failed to write record')
    return NextResponse.json({ error: 'failed to write record' }, { status: 500 })
  }
  try {
    await ctx.db
      .insertInto('status')
      .values({
        uri,
        authorDid: agent.assertDid,
        status: record.status as string,
        createdAt: record.createdAt,
        indexedAt: new Date().toISOString(),
      })
      .execute()
  } catch (err) {
    ctx.logger.warn({ err }, 'failed to update computed view')
  }
  return res
}
