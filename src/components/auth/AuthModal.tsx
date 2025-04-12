
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../lib/supabase'
import { UserCircle, Loader2 } from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useState as useHookState } from '@hookstate/core'

interface AuthModalProps {
  onAuthSuccess?: () => void
}

export function AuthModal({ onAuthSuccess }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { toast } = useToast()

  // Custom sign-in handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: 'Missing information',
        description: 'Please enter both email and password',
        variant: 'destructive',
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        throw error
      }
      
      handleAuthSuccess()
    } catch (error: any) {
      console.error('Sign in error:', error)
      
      let errorMessage = 'There was a problem signing in'
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email before signing in.'
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Too many attempts. Please try again later.'
      }
      
      toast({
        title: 'Authentication error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Custom sign-up handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: 'Missing information',
        description: 'Please enter both email and password',
        variant: 'destructive',
      })
      return
    }
    
    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Don't use redirectTo here to avoid the 500 error
          emailRedirectTo: undefined,
          data: {
            full_name: email.split('@')[0], // Use part of email as name
          }
        }
      })
      
      if (error) {
        throw error
      }
      
      // Check if user is confirmed or needs email verification
      if (data.user?.identities?.length === 0) {
        toast({
          title: 'Email already registered',
          description: 'This email is already registered. Please sign in instead.',
          variant: 'destructive',
        })
        setActiveTab('sign-in')
      } else if (data.user && !data.session) {
        toast({
          title: 'Verification email sent',
          description: 'Please check your email to confirm your account',
        })
        setActiveTab('sign-in')
      } else {
        // User is auto-confirmed
        handleAuthSuccess()
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      
      let errorMessage = 'There was a problem signing up'
      
      if (error.message.includes('already registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.'
        setActiveTab('sign-in')
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Too many attempts. Please try again later.'
      }
      
      toast({
        title: 'Authentication error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthSuccess = () => {
    setIsLoading(false)
    if (onAuthSuccess) {
      onAuthSuccess()
    }
    setIsOpen(false)
    
    toast({
      title: 'Authentication successful',
      description: 'You have been signed in successfully',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) {
        setIsLoading(false)
        setEmail('')
        setPassword('')
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserCircle className="h-5 w-5" />
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to Beautiful Tasks</DialogTitle>
        </DialogHeader>
        <div className="py-4 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-10">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'sign-in' | 'sign-up')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="sign-in">Sign In</TabsTrigger>
              <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sign-in">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="sign-up">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Password must be at least 6 characters
                  </p>
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}