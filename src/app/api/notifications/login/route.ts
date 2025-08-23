import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { sendEmail, renderLoginEmail } from '@/lib/resend'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!user?.email) {
      return NextResponse.json({ error: 'Missing user email' }, { status: 400 })
    }

    try {
      const name = (user.user_metadata?.full_name as string) || (user.user_metadata?.first_name as string)
      await sendEmail({
        to: user.email,
        subject: 'You signed in to TechsSouq',
        html: renderLoginEmail(user.email, name),
      })
    } catch (emailError) {
      console.error('Login email failed:', emailError)
      // Still return OK to avoid blocking the client
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error in login notification route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


