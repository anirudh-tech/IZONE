'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase'
import { useToast } from './ToastContext'

interface AuthContextType {
  user: User | null
  loading: boolean
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
const getUserNames = (user: User) => {
  // First, try to get names from user metadata (Google OAuth provides these)
  let firstName = user.user_metadata?.first_name || ''
  let lastName = user.user_metadata?.last_name || ''
  
  // If no names available, extract from email
  if (!firstName && !lastName && user.email) {
    const extracted = extractNamesFromEmail(user.email)
    firstName = extracted.firstName
    lastName = extracted.lastName
  }
  
  return { firstName, lastName }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const supabase = createSupabaseClient()
  const { showToast } = useToast()

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting initial session:', error)
        }
        
        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
          setInitialized(true)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        if (mounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        const currentUser = session?.user ?? null
        
        try {
          // If this is a new Google OAuth user without proper name data, update it
          if (event === 'SIGNED_IN' && currentUser && currentUser.app_metadata?.provider === 'google') {
            const { firstName, lastName } = getUserNames(currentUser)
            
            // Check if we need to update the user metadata
            const needsUpdate = !currentUser.user_metadata?.first_name || !currentUser.user_metadata?.last_name
            
            if (needsUpdate && (firstName || lastName)) {
              try {
                await supabase.auth.updateUser({
                  data: {
                    first_name: firstName,
                    last_name: lastName,
                    full_name: `${firstName} ${lastName}`.trim(),
                  }
                })
              } catch (error) {
                console.log('Could not update user metadata:', error)
              }
            }
          }
        } catch (error) {
          console.error('Error handling auth state change:', error)
        }
        
        if (mounted) {
          setUser(currentUser)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (result.error) {
        showToast(result.error.message || 'Sign in failed', 'error')
      } else {
        showToast('Signed in successfully!', 'success')
      }
      return result
    } catch (error) {
      console.error('Sign in error:', error)
      showToast('Sign in failed. Please try again.', 'error')
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
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

      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: finalUserData
        }
      })
      if (result.error) {
        showToast(result.error.message || 'Sign up failed', 'error')
      } else {
        showToast('Account created successfully! Please check your email to verify your account.', 'success')
      }
      return result
    } catch (error) {
      console.error('Sign up error:', error)
      showToast('Sign up failed. Please try again.', 'error')
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const result = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      if (result.error) {
        showToast(result.error.message || 'Google sign in failed', 'error')
      } else {
        showToast('Redirecting to Google...', 'info')
      }
      return result
    } catch (error) {
      console.error('Google sign in error:', error)
      showToast('Google sign in failed. Please try again.', 'error')
      throw error
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      showToast('Signed out successfully!', 'success')
    } catch (error) {
      console.error('Sign out error:', error)
      showToast('Sign out failed. Please try again.', 'error')
      // Still set user to null even if there's an error
      setUser(null)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (result.error) {
        showToast(result.error.message || 'Password reset failed', 'error')
      } else {
        showToast('Password reset email sent! Please check your inbox.', 'success')
      }
      return result
    } catch (error) {
      console.error('Reset password error:', error)
      showToast('Password reset failed. Please try again.', 'error')
      throw error
    }
  }

  const updateProfile = async (userData: any) => {
    try {
      const result = await supabase.auth.updateUser({
        data: userData
      })
      if (result.error) {
        showToast(result.error.message || 'Profile update failed', 'error')
      } else {
        showToast('Profile updated successfully!', 'success')
      }
      return result
    } catch (error) {
      console.error('Update profile error:', error)
      showToast('Profile update failed. Please try again.', 'error')
      throw error
    }
  }

  const value = {
    user,
    loading: loading || !initialized,
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