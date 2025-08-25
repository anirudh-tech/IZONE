import { NextRequest, NextResponse } from 'next/server'
import { createAppwriteServerClient } from '@/lib/appwrite-server'
import { sendEmail, renderLoginEmail } from '@/lib/resend'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const userId = searchParams.get('userId')
  const secret = searchParams.get('secret')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (userId && secret) {
    try {
      const { account } = createAppwriteServerClient()
      
      // Create session from OAuth callback
      const session = await account.createSession(userId, secret)
      
      try {
        // Get user data
        const user = await account.get()
        
        if (user?.email) {
          // Check if user was created recently (indicating this is a signup)
          const userCreatedAt = new Date(user.$createdAt)
          const now = new Date()
          const timeDifference = now.getTime() - userCreatedAt.getTime()
          const isNewUser = timeDifference < 5 * 60 * 1000 // 5 minutes threshold
          
          if (isNewUser) {
            const name = user.name || user.prefs?.full_name || user.prefs?.first_name || 'User'
            try {
              await sendEmail({
                to: user.email,
                subject: 'Welcome to TechSouq!',
                html: renderLoginEmail(user.email, name),
              })
            } catch (emailError) {
              console.error('Failed to send welcome email:', emailError)
            }
          }
        }
      } catch (userError) {
        console.error('Failed to get user data:', userError)
      }
      
      // Set session cookie and redirect
      const response = NextResponse.redirect(`${origin}${next}`)
      response.cookies.set('appwrite-session', session.secret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })
      
      return response
    } catch (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(`${origin}/sign-in?error=oauth_callback_error`)
    }
  }

  // return the user to sign-in with error
  return NextResponse.redirect(`${origin}/sign-in?error=oauth_callback_missing_params`)
}
