import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { env } from '@/lib/env'

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/', req.url))
  const session = await getIronSession<{ did?: string }>(req, res, {
    cookieName: 'sid',
    password: env.COOKIE_SECRET,
  })
  await session.destroy()
  return res
}
