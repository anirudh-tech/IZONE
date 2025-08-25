import { createAppwriteServerClient } from './appwrite-server'
import { cookies } from 'next/headers'

export async function getSession() {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('appwrite-session')
    
    if (!sessionCookie) {
      return null
    }
    
    // For Appwrite, we return a mock session object
    // The actual session validation happens in the server client
    return {
      access_token: sessionCookie.value,
      user: null // Will be populated by getUser if needed
    }
  } catch (error) {
    console.error('Error in getSession:', error)
    return null
  }
}

export async function getUser() {
  try {
    const { account } = createAppwriteServerClient()
    const user = await account.get()
    return user
  } catch (error) {
    // User not authenticated or session invalid
    console.error('Error in getUser:', error)
    return null
  }
}
