
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../lib/supabase'
import { UserCircle, Loader2 } from 'lucide-react'
import { useToast } from '../../hooks/use-toast'

interface AuthModalProps {
  onAuthSuccess?: () => void
}

export function AuthModal({ onAuthSuccess }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Set the redirect URL based on the current environment
  useEffect(() => {
    // Get the current URL
    const currentUrl = window.location.origin
    setRedirectUrl(currentUrl)
  }, [])

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

  const handleAuthError = (error: Error) => {
    setIsLoading(false)
    console.error('Authentication error:', error)
    
    // Provide more user-friendly error messages
    let errorMessage = 'There was a problem with authentication'
    
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
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) {
        setIsLoading(false)
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
          <DialogTitle>Sign In / Sign Up</DialogTitle>
        </DialogHeader>
        <div className="py-4 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-10">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          )}
          
          {redirectUrl && (
            <Auth
              supabaseClient={supabase}
              appearance={{ 
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#4f46e5',
                      brandAccent: '#4338ca',
                    },
                  },
                },
              }}
              providers={[]}
              redirectTo={redirectUrl}
              onlyThirdPartyProviders={false}
              magicLink={false}
              view="sign_in"
              showLinks={true}
              onSuccess={handleAuthSuccess}
              onError={handleAuthError}
              // Set a callback for when the form is submitted
              // to show loading state
              localization={{
                variables: {
                  sign_in: {
                    button_label: 'Sign In',
                    loading_label: 'Signing in...',
                  },
                  sign_up: {
                    button_label: 'Sign Up',
                    loading_label: 'Signing up...',
                  },
                },
              }}
            />
          )}
          
          <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}