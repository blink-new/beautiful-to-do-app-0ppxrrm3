
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../lib/supabase'
import { UserCircle } from 'lucide-react'
import { useToast } from '../../hooks/use-toast'

interface AuthModalProps {
  onAuthSuccess?: () => void
}

export function AuthModal({ onAuthSuccess }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState<string>('')
  const { toast } = useToast()

  // Set the redirect URL based on the current environment
  useEffect(() => {
    // Get the current URL
    const currentUrl = window.location.origin
    setRedirectUrl(currentUrl)
  }, [])

  const handleAuthSuccess = () => {
    if (onAuthSuccess) {
      onAuthSuccess()
    }
    setIsOpen(false)
  }

  const handleAuthError = (error: Error) => {
    console.error('Authentication error:', error)
    toast({
      title: 'Authentication error',
      description: error.message || 'There was a problem with authentication',
      variant: 'destructive',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
        <div className="py-4">
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
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}