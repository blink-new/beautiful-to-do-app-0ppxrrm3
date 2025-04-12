
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
        console.error('Error refreshing session:', error)
        return
      }
      
      setSession(data.session)
      setUser(data.session?.user ?? null)
    } catch (error) {
      console.error('Error refreshing session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Get initial session
    refreshSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event)
      
      setSession(newSession)
      setUser(newSession?.user ?? null)
      
      if (event === 'SIGNED_IN') {
        toast({
          title: 'Signed in successfully',
          description: `Welcome${newSession?.user?.email ? ` ${newSession.user.email}` : ''}!`,
        })
      } else if (event === 'SIGNED_OUT') {
        // We handle this in the sign-out function
      } else if (event === 'USER_UPDATED') {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated',
        })
      } else if (event === 'PASSWORD_RECOVERY') {
        toast({
          title: 'Password recovery initiated',
          description: 'Please check your email for password reset instructions',
        })
      }
      
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [toast])

  const value = {
    user,
    session,
    isLoading,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}