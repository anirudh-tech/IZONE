import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate envs early
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
        },
        { status: 500 }
      )
    }
    const supabase = createSupabaseAdminClient()
    const userId = params.id

    // Fetch user first
    const { data: fetched, error: fetchErr } = await supabase.auth.admin.getUserById(userId)
    if (fetchErr || !fetched?.user) {
      return NextResponse.json({ error: fetchErr?.message || 'User not found' }, { status: 404 })
    }

    const currentlyBanned = !!fetched.user.banned_until && new Date(fetched.user.banned_until) > new Date()
    let banned_until: string | null
    if (currentlyBanned) {
      banned_until = null // unban
    } else {
      // ban for 100 years
      const farFuture = new Date()
      farFuture.setFullYear(farFuture.getFullYear() + 100)
      banned_until = farFuture.toISOString()
    }

    const { data: updated, error } = await supabase.auth.admin.updateUserById(userId, { banned_until })
    if (error || !updated?.user) {
      return NextResponse.json({ error: error?.message || 'Failed to update user' }, { status: 500 })
    }

    const response = {
      id: updated.user.id,
      email: updated.user.email,
      created_at: updated.user.created_at,
      role: (updated.user.user_metadata as any)?.role || 'user',
      banned: !!updated.user.banned_until && new Date(updated.user.banned_until) > new Date(),
    }
    return NextResponse.json(response)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update user' }, { status: 500 })
  }
}


