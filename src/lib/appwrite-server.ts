import { Client, Account, Databases, Storage, ID } from 'appwrite'
import { cookies } from 'next/headers'

const appwriteUrl = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!

// Server-side Appwrite client for use in Server Components, API routes, etc.
export const createAppwriteServerClient = () => {
  const client = new Client()
    .setEndpoint(appwriteUrl)
    .setProject(appwriteProjectId)

  // Get session cookie if it exists
  const cookieStore = cookies()
  const session = cookieStore.get('appwrite-session')
  
  if (session) {
    client.setSession(session.value)
  }

  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client)
  }
}

// Helper function to set session cookie
export const setSessionCookie = (session: string) => {
  const cookieStore = cookies()
  cookieStore.set('appwrite-session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })
}

// Helper function to clear session cookie
export const clearSessionCookie = () => {
  const cookieStore = cookies()
  cookieStore.set('appwrite-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  })
}
