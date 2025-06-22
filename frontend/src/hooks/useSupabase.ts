import { useState, useEffect } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: AuthError | null
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        setState({
          user: session?.user ?? null,
          session,
          loading: false,
          error,
        })
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error as AuthError,
        }))
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
        })
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return state
}

export interface AuthActions {
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>
}

export function useAuthActions(): AuthActions {
  const signUp = async (email: string, password: string, metadata?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error }
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error }
  }

  return {
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  }
}

// Generic hook for Supabase queries
export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await queryFn()

      if (error) {
        setError(error)
      } else {
        setData(data)
      }
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies)

  return { data, loading, error, refetch: fetchData }
}

// Hook for real-time subscriptions
export function useSupabaseSubscription<T>(
  table: string,
  filter?: string,
  callback?: (payload: any) => void
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    let subscription: any

    const setupSubscription = async () => {
      try {
        // Initial data fetch
        let query = supabase.from(table).select('*')
        
        if (filter) {
          // Apply filter if provided
          query = query.filter(filter.split('=')[0], 'eq', filter.split('=')[1])
        }

        const { data: initialData, error: initialError } = await query

        if (initialError) {
          setError(initialError)
        } else {
          setData(initialData || [])
        }

        // Set up real-time subscription
        subscription = supabase
          .channel(`${table}_changes`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table,
              filter,
            },
            (payload) => {
              if (callback) {
                callback(payload)
              }

              // Update local data based on the change
              setData(currentData => {
                const newData = [...currentData]
                
                switch (payload.eventType) {
                  case 'INSERT':
                    newData.push(payload.new as T)
                    break
                  case 'UPDATE':
                    const updateIndex = newData.findIndex((item: any) => item.id === payload.new.id)
                    if (updateIndex !== -1) {
                      newData[updateIndex] = payload.new as T
                    }
                    break
                  case 'DELETE':
                    return newData.filter((item: any) => item.id !== payload.old.id)
                }
                
                return newData
              })
            }
          )
          .subscribe()

      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    setupSubscription()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [table, filter])

  return { data, loading, error }
}

// Hook for user profile
export function useUserProfile() {
  const { user } = useAuth()
  
  return useSupabaseQuery(
    async () => {
      if (!user) return { data: null, error: null }
      
      return await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
    },
    [user?.id]
  )
}

// Hook for announcements
export function useAnnouncements(filters?: { category?: string; limit?: number }) {
  return useSupabaseQuery(
    async () => {
      let query = supabase
        .from('announcements')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })

      if (filters?.category) {
        query = query.eq('category', filters.category)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      return await query
    },
    [filters?.category, filters?.limit]
  )
}
