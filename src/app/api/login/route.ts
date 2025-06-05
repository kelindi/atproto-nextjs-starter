import { getContext } from '@/lib/context'
import { NextRequest, NextResponse } from 'next/server'
import { isValidHandle } from '@atproto/syntax'
import { OAuthResolverError } from '@atproto/oauth-client-node'

export async function POST(req: NextRequest) {
  const ctx = await getContext()
  const form = await req.formData()
  const handle = form.get('handle')
  if (typeof handle !== 'string' || !isValidHandle(handle)) {
    return NextResponse.json({ error: 'invalid handle' }, { status: 400 })
  }
  try {
    const url = await ctx.oauthClient.authorize(handle, {
      scope: 'atproto transition:generic',
    })
    return NextResponse.redirect(url)
  } catch (err) {
    ctx.logger.error({ err }, 'oauth authorize failed')
    const message = err instanceof OAuthResolverError ? err.message : "couldn't initiate login"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
