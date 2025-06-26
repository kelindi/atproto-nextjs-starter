import { getContext } from '@/lib/context'
import { NextRequest, NextResponse } from 'next/server'
import { isValidHandle } from '@atproto/syntax'
import { OAuthResolverError } from '@atproto/oauth-client-node'

export async function POST(req: NextRequest) {
  const ctx = await getContext()
  const form = await req.formData()
  const handle = form.get('handle')
  
  if (typeof handle !== 'string' || !isValidHandle(handle)) {
    return NextResponse.json({ 
      error: 'invalid_handle',
      message: 'Please enter a valid Bluesky handle (e.g., alice.bsky.social)' 
    }, { status: 400 })
  }

  try {
    console.log(
      '>>> Critical Check: Redirect URIs at login time:',
      ctx.oauthClient.clientMetadata.redirect_uris,
    )
    const url = await ctx.oauthClient.authorize(handle, {
      scope: 'atproto transition:generic',
    })
    return NextResponse.redirect(url, 302)
  } catch (err) {
    ctx.logger.error({ err }, 'oauth authorize failed')
    
    if (err instanceof OAuthResolverError) {
      // Handle specific OAuth errors
      if (err.message.includes('invalid_client_metadata')) {
        return NextResponse.json({ 
          error: 'client_error',
          message: 'Unable to verify application credentials. Please try again later.' 
        }, { status: 500 })
      }
      if (err.message.includes('invalid_redirect_uri')) {
        return NextResponse.json({ 
          error: 'redirect_error',
          message: 'Invalid redirect configuration. Please contact support.' 
        }, { status: 500 })
      }
      return NextResponse.json({ 
        error: 'oauth_error',
        message: err.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'server_error',
      message: 'An unexpected error occurred. Please try again later.' 
    }, { status: 500 })
  }
}
