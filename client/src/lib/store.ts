import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from './supabase'

interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  company_name?: string
  plan?: string
}

interface AuthState {
  user: User | null
  session: any | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setSession: (session: any | null) => void
  setLoading: (loading: boolean) => void
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),

      signIn: async (email, password) => {
        if (!isSupabaseConfigured) {
          // Demo mode - auto login
          set({ 
            user: { id: 'demo', email, full_name: 'Demo User' },
            isAuthenticated: true 
          })
          return {}
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          return { error: error.message }
        }

        set({
          user: data.user as any,
          session: data.session,
          isAuthenticated: true
        })

        return {}
      },

      signUp: async (email, password, fullName) => {
        if (!isSupabaseConfigured) {
          return { error: 'Supabase not configured. Running in demo mode.' }
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        })

        if (error) {
          return { error: error.message }
        }

        return {}
      },

      signOut: async () => {
        if (isSupabaseConfigured) {
          await supabase.auth.signOut()
        }
        set({ user: null, session: null, isAuthenticated: false })
      },

      checkAuth: async () => {
        set({ isLoading: true })

        if (!isSupabaseConfigured) {
          // Demo mode - check localStorage
          const stored = localStorage.getItem('auth-storage')
          if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed.state?.user) {
              set({ isAuthenticated: true, isLoading: false })
              return
            }
          }
          set({ isLoading: false })
          return
        }

        try {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            set({
              user: session.user as any,
              session,
              isAuthenticated: true
            })
          }
        } catch (error) {
          console.error('Auth check failed:', error)
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
)

// Initialize auth on load
if (typeof window !== 'undefined') {
  useAuthStore.getState().checkAuth()
  
  // Listen for auth changes
  if (isSupabaseConfigured) {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        useAuthStore.setState({
          user: session.user as any,
          session,
          isAuthenticated: true
        })
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({
          user: null,
          session: null,
          isAuthenticated: false
        })
      }
    })
  }
}
