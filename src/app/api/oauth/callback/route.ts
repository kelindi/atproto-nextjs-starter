import { getContext } from '@/lib/context'
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'

export async function GET(req: NextRequest) {
  const ctx = await getContext()
  const params = req.nextUrl.searchParams
  const res = NextResponse.redirect(new URL('/', req.url))
  try {
    const { session } = await ctx.oauthClient.callback(params)
    const sess = await getIronSession<SessionData>(req, res, sessionOptions)
    sess.did = session.did
    await sess.save()
  } catch (err) {
    ctx.logger.error({ err }, 'oauth callback failed')
    return NextResponse.redirect(new URL('/?error', req.url))
  }
  return res
}
