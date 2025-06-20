'use client'

import { useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: AuthError | null
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Record<string, unknown>) => Promise<{ error: AuthError | null }>
}

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  useEffect(() => {
    // Skip auth setup if using placeholder credentials
    if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          setError(error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (err) {
        console.error('Error getting initial session:', err)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        setError(null)

        // Handle specific auth events
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session?.user?.email)
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      setError(error)
    }
    
    setLoading(false)
    return { error }
  }

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    
    if (error) {
      setError(error)
    }
    
    setLoading(false)
    return { error }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      setError(error)
    }
    
    setLoading(false)
    return { error }
  }

  const resetPassword = async (email: string) => {
    setError(null)
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    
    if (error) {
      setError(error)
    }
    
    return { error }
  }

  const updatePassword = async (password: string) => {
    setError(null)
    
    const { error } = await supabase.auth.updateUser({
      password,
    })
    
    if (error) {
      setError(error)
    }
    
    return { error }
  }

  const updateProfile = async (updates: Record<string, unknown>) => {
    setError(null)
    
    const { error } = await supabase.auth.updateUser({
      data: updates,
    })
    
    if (error) {
      setError(error)
    }
    
    return { error }
  }

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  }
}
