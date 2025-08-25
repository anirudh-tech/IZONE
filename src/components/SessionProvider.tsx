'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Models } from 'appwrite'
import { account } from '@/lib/appwrite'

type AppwriteUser = Models.User<Models.Preferences>
type AppwriteSession = Models.Session

interface SessionContextType {
  session: AppwriteSession | null
  user: AppwriteUser | null
  loading: boolean
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  user: null,
  loading: true,
})

export function SessionProvider({ 
  children, 
  initialSession,
  initialUser
}: { 
  children: React.ReactNode
  initialSession?: AppwriteSession | null
  initialUser?: AppwriteUser | null
}) {
  const [session, setSession] = useState<AppwriteSession | null>(initialSession || null)
  const [user, setUser] = useState<AppwriteUser | null>(initialUser || null)
  const [loading, setLoading] = useState(!initialSession)

  useEffect(() => {
    let mounted = true

    // If we have initial data, we're already hydrated
    if (initialSession && initialUser) {
      setLoading(false)
      return
    }

    // Get initial session and user
    const getInitialSession = async () => {
      try {
        const currentUser = await account.get()
        
        if (mounted && currentUser) {
          setUser(currentUser)
          // Since we have a user, we implicitly have a session
          setSession({} as AppwriteSession) // Appwrite doesn't expose session details in client SDK
          setLoading(false)
        }
      } catch (error) {
        // User is not logged in
        if (mounted) {
          setSession(null)
          setUser(null)
          setLoading(false)
        }
      }
    }

    getInitialSession()

    return () => {
      mounted = false
      setLoading(false)
    }
  }, [initialSession, initialUser])

  return (
    <SessionContext.Provider value={{ session, user, loading }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
