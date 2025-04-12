
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../hooks/use-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  refreshSession: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  refreshSession: async () => {},
  signOut: async () => {},
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

  const signOut = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error signing out:', error)
        toast({
          title: 'Error signing out',
          description: 'There was a problem signing out',
          variant: 'destructive',
        })
        return
      }
      
      setSession(null)
      setUser(null)
      
      toast({
        title: 'Signed out successfully',
        description: 'You have been signed out of your account',
      })
    } catch (error) {
      console.error('Exception during sign out:', error)
      toast({
        title: 'Error signing out',
        description: 'There was a problem signing out',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle auth state changes from hash fragment or local storage
  useEffect(() => {
    // Check for auth redirect (hash fragment)
    const handleAuthRedirect = async () => {
      try {
        // This will detect and exchange auth code for session if present in URL
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error handling auth redirect:', error)
          return
        }
        
        if (data.session) {
          setSession(data.session)
          setUser(data.session.user)
          
          // Clear the URL hash fragment after successful auth
          if (window.location.hash.includes('access_token')) {
            window.history.replaceState(null, '', window.location.pathname)
          }
        }
      } catch (error) {
        console.error('Error in handleAuthRedirect:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    handleAuthRedirect()
    
    // Listen for auth state changes
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
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}