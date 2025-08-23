import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    // Validate required env vars
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) {
      return NextResponse.json(
        {
          error: 'Supabase environment variables are missing',
          details: {
            NEXT_PUBLIC_SUPABASE_URL: !!url,
            SUPABASE_SERVICE_ROLE_KEY: !!serviceKey,
          },
          hint: 'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and restart the server.'
        },
        { status: 500 }
      )
    }

    const supabase = createSupabaseAdminClient()
    // Use auth admin list users
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    const users = (data.users || []).map(u => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      role: (u.user_metadata as any)?.role || 'user',
      banned: !!u.banned_until && new Date(u.banned_until) > new Date(),
    }))
    return NextResponse.json(users)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to list users' }, { status: 500 })
  }
}


