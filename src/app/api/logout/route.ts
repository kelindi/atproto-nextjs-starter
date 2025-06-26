import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    // Determine response type based on request headers
    const acceptHeader = req.headers.get('accept')
    const isJsonRequest = acceptHeader?.includes('application/json')
    
    if (isJsonRequest) {
      // For fetch requests, return JSON response
      const response = NextResponse.json({ success: true, message: 'Logged out successfully' })
      const session = await getIronSession<SessionData>(req, response, sessionOptions)
      await session.destroy()
      return response
    } else {
      // For form submissions, redirect
      const response = NextResponse.redirect(new URL('/', req.url))
      const session = await getIronSession<SessionData>(req, response, sessionOptions)
      await session.destroy()
      return response
    }
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
