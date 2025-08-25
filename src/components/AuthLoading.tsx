'use client'

import { useAuth } from '@/contexts/AuthContext'

interface AuthLoadingProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthLoading({ children, fallback }: AuthLoadingProps) {
  const { loading, initialized } = useAuth()

  // Show fallback while loading or not initialized
  if (loading || !initialized) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  return <>{children}</>
}

// Alternative component for when you want to show different content based on auth state
export function AuthGuard({ 
  children, 
  fallback,
  requireAuth = false 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
}) {
  const { user, loading, initialized } = useAuth()

  // Show loading state
  if (loading || !initialized) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  // If auth is required but user is not logged in
  if (requireAuth && !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to access this page.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
