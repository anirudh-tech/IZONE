'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Models, ID, OAuthProvider } from 'appwrite'
import { account } from '@/lib/appwrite'
import { useToast } from './ToastContext'
import { useSession } from '@/components/SessionProvider'

type AppwriteUser = Models.User<Models.Preferences>

interface AuthContextType {
  user: AppwriteUser | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, userData?: any) => Promise<any>
  signInWithGoogle: () => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<any>
  updateProfile: (userData: any) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to extract names from email
const extractNamesFromEmail = (email: string) => {
  const localPart = email.split('@')[0]
  
  // Remove common separators and numbers
  const cleanedName = localPart
    .replace(/[0-9]+/g, '') // Remove numbers
    .replace(/[._-]+/g, ' ') // Replace dots, underscores, hyphens with spaces
    .trim()
  
  // Split into words and capitalize each
  const words = cleanedName.split(' ').filter(word => word.length > 0)
  const capitalizedWords = words.map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  )
  
  if (capitalizedWords.length >= 2) {
    return {
      firstName: capitalizedWords[0],
      lastName: capitalizedWords.slice(1).join(' ')
    }
  } else if (capitalizedWords.length === 1) {
    return {
      firstName: capitalizedWords[0],
      lastName: ''
    }
  } else {
    return {
      firstName: 'User',
      lastName: ''
    }
  }
}

// Helper function to get user names with fallback to email extraction
const getUserNames = (user: AppwriteUser) => {
  // First, try to get names from user prefs (Appwrite stores custom data in prefs)
  let firstName = user.prefs?.first_name || ''
  let lastName = user.prefs?.last_name || ''
  
  // If no names available, extract from email
  if (!firstName && !lastName && user.email) {
    const extracted = extractNamesFromEmail(user.email)
    firstName = extracted.firstName
    lastName = extracted.lastName
  }
  
  return { firstName, lastName }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { session, user: sessionUser, loading: sessionLoading } = useSession()
  const [user, setUser] = useState<AppwriteUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const { showToast } = useToast()

  // Sync with session from SessionProvider
  useEffect(() => {
    if (sessionUser !== undefined) {
      setUser(sessionUser)
      setInitialized(true)
      setLoading(false)
    }
  }, [sessionUser])

  // Global error handler to prevent stuck states
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      // Reset loading state if there's an unhandled error
      setLoading(false)
    }

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
      // Reset loading state if there's a global error
      setLoading(false)
    }

    // Periodic check to prevent stuck loading states
    const loadingCheckInterval = setInterval(() => {
      if (loading && !user) {
        // If we've been loading for a while without a user, reset the state
        const timeSinceLastAction = Date.now() - (window as any).lastAuthAction || 0
        if (timeSinceLastAction > 30000) { // 30 seconds
          console.warn('Loading state stuck for too long, resetting...')
          setLoading(false)
        }
      }
    }, 5000) // Check every 5 seconds

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
      clearInterval(loadingCheckInterval)
    }
  }, [loading, user])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Track the last auth action for periodic checks
      ;(window as any).lastAuthAction = Date.now()
      
      // Create session with Appwrite
      const session = await account.createEmailPasswordSession(email, password)
      
      // Get user data after successful login
      const user = await account.get()
      setUser(user)
      
      showToast('Signed in successfully!', 'success')
      return { session, user, error: null }
    } catch (error: any) {
      console.error('Sign in error:', error)
      const errorMessage = error.message || 'Sign in failed. Please check your credentials.'
      showToast(errorMessage, 'error')
      return { session: null, user: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true)
      
      // Track the last auth action for periodic checks
      ;(window as any).lastAuthAction = Date.now()
      
      // If no userData provided, extract names from email
      let finalUserData = userData
      if (!userData || (!userData.first_name && !userData.last_name)) {
        const { firstName, lastName } = extractNamesFromEmail(email)
        finalUserData = {
          ...userData,
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
        }
      }

      // Create account with Appwrite
      const userId = ID.unique()
      const user = await account.create(
        userId,
        email,
        password,
        finalUserData?.full_name || finalUserData?.first_name || 'User'
      )
      
      // Update user preferences with additional data
      if (finalUserData) {
        try {
          await account.updatePrefs({
            first_name: finalUserData.first_name,
            last_name: finalUserData.last_name,
            full_name: finalUserData.full_name
          })
        } catch (prefError) {
          console.warn('Could not update user preferences:', prefError)
        }
      }
      
      // Send verification email
      await account.createVerification(`${window.location.origin}/verify-email`)
      
      showToast('Account created successfully! Please check your email to verify your account.', 'success')
      return { user, error: null }
    } catch (error: any) {
      console.error('Sign up error:', error)
      const errorMessage = error.message || 'Sign up failed. Please try again.'
      showToast(errorMessage, 'error')
      return { user: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      
      // Initiate OAuth flow with Appwrite
      await account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/auth/callback`,
        `${window.location.origin}/sign-in`
      )
      
      showToast('Redirecting to Google...', 'info')
      return { error: null }
    } catch (error: any) {
      console.error('Google sign in error:', error)
      const errorMessage = error.message || 'Google sign in failed. Please try again.'
      showToast(errorMessage, 'error')
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      // Track the last auth action for periodic checks
      ;(window as any).lastAuthAction = Date.now()
      
      // Clear user state immediately to prevent race conditions
      setUser(null)
      
      // Check network status before attempting signout
      if (!navigator.onLine) {
        console.warn('Network is offline, user logged out locally')
        showToast('Signed out successfully! (offline mode)', 'success')
        return
      }
      
      // Delete current session with Appwrite
      await account.deleteSession('current')
      
      showToast('Signed out successfully!', 'success')
    } catch (error: any) {
      console.error('Sign out error:', error)
      // Even if the API call fails, clear local state
      setUser(null)
      
      // For most errors, still show success since user is logged out locally
      if (error.code === 401 || error.message?.includes('session')) {
        showToast('Signed out successfully!', 'success')
      } else {
        showToast('Sign out completed (with some issues)', 'warning')
      }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      
      // Create password recovery with Appwrite
      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      )
      
      showToast('Password reset email sent! Please check your inbox.', 'success')
      return { error: null }
    } catch (error: any) {
      console.error('Reset password error:', error)
      const errorMessage = error.message || 'Password reset failed. Please try again.'
      showToast(errorMessage, 'error')
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (userData: any) => {
    try {
      setLoading(true)
      
      let updatedUser = user
      
      // Update name if provided
      if (userData.name || userData.full_name) {
        const newName = userData.name || userData.full_name
        updatedUser = await account.updateName(newName)
      }
      
      // Update email if provided (this requires verification)
      if (userData.email && userData.email !== user?.email) {
        await account.updateEmail(userData.email, userData.password || '')
      }
      
      // Update password if provided
      if (userData.password && userData.oldPassword) {
        await account.updatePassword(userData.password, userData.oldPassword)
      }
      
      // Update preferences for custom data
      if (userData.first_name || userData.last_name || userData.full_name) {
        const prefs = {
          ...user?.prefs,
          first_name: userData.first_name || user?.prefs?.first_name,
          last_name: userData.last_name || user?.prefs?.last_name,
          full_name: userData.full_name || userData.name || user?.prefs?.full_name
        }
        await account.updatePrefs(prefs)
      }
      
      // Refresh user data
      const refreshedUser = await account.get()
      setUser(refreshedUser)
      
      showToast('Profile updated successfully!', 'success')
      return { user: refreshedUser, error: null }
    } catch (error: any) {
      console.error('Update profile error:', error)
      const errorMessage = error.message || 'Profile update failed. Please try again.'
      showToast(errorMessage, 'error')
      return { user: null, error }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading: loading || sessionLoading || !initialized,
    initialized,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 