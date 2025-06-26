import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { Agent } from '@atproto/api'
import { TID } from '@atproto/common'

import { getContext } from '@/lib/context'
import { sessionOptions, SessionData } from '@/lib/session'
import * as Status from '@/lexicon/types/xyz/statusphere/status'

interface StatusRecord {
  $type: string
  status: string
  createdAt: string
}

const STATUS_COLLECTION = 'xyz.statusphere.status'
const STATUS_TYPE = 'xyz.statusphere.status'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await getContext()
    
    // Create a response object for session handling
    const res = NextResponse.redirect(new URL('/', req.url))
    const session = await getIronSession<SessionData>(req, res, sessionOptions)

    // Check if user is authenticated
    if (!session.did) {
      return NextResponse.json(
        { error: 'Session required' }, 
        { status: 401 }
      )
    }

    // Parse the request body
    const body = new URLSearchParams(await req.text())
    const status = body.get('status')

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Restore the user's AT Protocol session
    const agentSession = await ctx.oauthClient.restore(session.did)
    if (!agentSession) {
      return NextResponse.json(
        { error: 'No valid session found' }, 
        { status: 401 }
      )
    }

    const agent = new Agent(agentSession)
    const recordKey = TID.nextStr()
    
    // Create the status record
    const record: StatusRecord = {
      $type: STATUS_TYPE,
      status,
      createdAt: new Date().toISOString(),
    }

    // Validate the record
    if (!Status.validateRecord(record).success) {
      return NextResponse.json(
        { error: 'Invalid status format' }, 
        { status: 400 }
      )
    }

    // Write the record to AT Protocol
    let uri: string
    try {
      const putResult = await agent.com.atproto.repo.putRecord({
        repo: agent.assertDid,
        collection: STATUS_COLLECTION,
        rkey: recordKey,
        record,
        validate: false,
      })
      uri = putResult.data.uri
    } catch (err) {
      ctx.logger.warn({ err }, 'Failed to write record to AT Protocol')
      return NextResponse.json(
        { error: 'Failed to save status' }, 
        { status: 500 }
      )
    }

    // Add to local status store
    await ctx.statusStore.add({
      uri,
      authorDid: agent.assertDid,
      status: record.status,
      createdAt: record.createdAt,
      indexedAt: new Date().toISOString(),
    })

    return NextResponse.json({ 
      success: true, 
      uri,
      status: record.status 
    })

  } catch (error) {
    console.error('Error in status API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
