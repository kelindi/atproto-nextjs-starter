import { getContext } from '@/lib/context'
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'
import { env } from '@/lib/env'

export async function GET(req: NextRequest) {
  const ctx = await getContext()
  const params = req.nextUrl.searchParams
  console.log('OAuth callback hit:', req.url)

  // Force the redirect base URL to be the public one, not the request's URL
  const baseUrl = env.PUBLIC_URL || new URL('/', req.url).toString()
  const res = NextResponse.redirect(new URL('/', baseUrl))

  try {
    const { session } = await ctx.oauthClient.callback(params)
    const sess = await getIronSession<SessionData>(req, res, sessionOptions)
    sess.did = session.did
    await sess.save()
  } catch (err) {
    ctx.logger.error({ err }, 'oauth callback failed')
    console.log('OAuth callback error:', err)
    // Also use the public base URL for the error redirect
    return NextResponse.redirect(new URL('/?error', baseUrl))
  }
  console.log('OAuth callback response:', res)
  return res
} 