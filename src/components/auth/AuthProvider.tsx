
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../hooks/use-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  refreshSession: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const refreshSession = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }
      
      setSession(data.session)
      setUser(data.session?.user ?? null)
    } catch (error) {
      console.error('Error refreshing session:', error)
      toast({
        title: 'Authentication error',
        description: 'There was a problem with your session',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Get initial session
    refreshSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    session,
    isLoading,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}