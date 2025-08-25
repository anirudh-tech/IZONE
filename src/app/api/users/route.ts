import { NextRequest, NextResponse } from 'next/server'
import { createAppwriteAdminClient } from '@/lib/appwrite-admin'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    // Validate required env vars
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
    const apiKey = process.env.APPWRITE_API_KEY
    if (!endpoint || !projectId || !apiKey) {
      return NextResponse.json(
        {
          error: 'Appwrite environment variables are missing',
          details: {
            NEXT_PUBLIC_APPWRITE_ENDPOINT: !!endpoint,
            NEXT_PUBLIC_APPWRITE_PROJECT_ID: !!projectId,
            APPWRITE_API_KEY: !!apiKey,
          },
          hint: 'Set NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, and APPWRITE_API_KEY and restart the server.'
        },
        { status: 500 }
      )
    }

    const { users } = createAppwriteAdminClient()
    // List users with Appwrite
    const userList = await users.list()
    
    const mappedUsers = userList.users.map(u => ({
      id: u.$id,
      email: u.email,
      created_at: u.$createdAt,
      role: u.prefs?.role || 'user',
      banned: u.status === false,
      name: u.name,
      emailVerification: u.emailVerification
    }))
    return NextResponse.json(mappedUsers)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to list users' }, { status: 500 })
  }
}


