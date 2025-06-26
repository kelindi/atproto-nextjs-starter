import { NodeOAuthClient } from '@atproto/oauth-client-node'
import { env } from '@/lib/env'
import { SessionStore, StateStore } from './storage'

export const createClient = async () => {
  const publicUrl = env.PUBLIC_URL
  console.log('==================')
  console.log('publicUrl', publicUrl)
  console.log('==================')
  const url = publicUrl || `http://127.0.0.1:${env.PORT}`
  const enc = encodeURIComponent
  return new NodeOAuthClient({
    clientMetadata: {
      client_name: 'Statusphere',
      client_id: publicUrl
        ? `${url}/api/client-metadata`
        : `http://localhost?redirect_uri=${enc(`${url}/oauth/callback`)}&scope=${enc('atproto transition:generic')}`,
      client_uri: url,
      redirect_uris: [`${url}/oauth/callback`],
      scope: 'atproto transition:generic',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      application_type: 'web',
      token_endpoint_auth_method: 'none',
      dpop_bound_access_tokens: true,
      logo_uri: `${url}/logo.png`,
      tos_uri: `${url}/terms`,
      policy_uri: `${url}/privacy`,
      contacts: ['support@statusphere.example'],
    },
    stateStore: new StateStore(),
    sessionStore: new SessionStore(),
  })
}
