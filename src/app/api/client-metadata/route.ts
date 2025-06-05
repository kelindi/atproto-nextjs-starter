import { getContext } from '@/lib/context'
import { NextResponse } from 'next/server'

export async function GET() {
  const ctx = await getContext()
  return NextResponse.json(ctx.oauthClient.clientMetadata)
}
