'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type ThemeChoice = 'system' | 'light' | 'dark'
export type EffectiveTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: ThemeChoice
  effectiveTheme: EffectiveTheme
  setTheme: (theme: ThemeChoice) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme(): EffectiveTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyThemeAttribute(effective: EffectiveTheme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.setAttribute('data-theme', effective)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeChoice>(() => {
    if (typeof window === 'undefined') return 'system'
    try {
      const saved = window.localStorage.getItem('theme') as ThemeChoice | null
      return saved ?? 'system'
    } catch {
      return 'system'
    }
  })

  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>(() => {
    if (theme === 'system') return getSystemTheme()
    return theme
  })

  // Persist user choice and update effective theme
  useEffect(() => {
    try {
      window.localStorage.setItem('theme', theme)
    } catch {}

    if (theme === 'system') {
      setEffectiveTheme(getSystemTheme())
    } else {
      setEffectiveTheme(theme)
    }
  }, [theme])

  // Listen to system changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setEffectiveTheme(media.matches ? 'dark' : 'light')
    if (media.addEventListener) {
      media.addEventListener('change', handler)
    } else {
      // Safari
      media.addListener(handler)
    }
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', handler)
      } else {
        media.removeListener(handler)
      }
    }
  }, [theme])

  // Apply attribute for CSS overrides
  useEffect(() => {
    applyThemeAttribute(effectiveTheme)
  }, [effectiveTheme])

  const value = useMemo<ThemeContextValue>(() => ({ theme, effectiveTheme, setTheme }), [theme, effectiveTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

 