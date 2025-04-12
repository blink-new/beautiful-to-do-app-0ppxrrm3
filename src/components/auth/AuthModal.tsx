
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../lib/supabase'
import { UserCircle } from 'lucide-react'

interface AuthModalProps {
  onAuthSuccess?: () => void
}

export function AuthModal({ onAuthSuccess }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAuthSuccess = () => {
    if (onAuthSuccess) {
      onAuthSuccess()
    }
    setIsOpen(false)
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
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            redirectTo={window.location.origin}
            onlyThirdPartyProviders={false}
            magicLink={false}
            view="sign_in"
            showLinks={true}
            onSuccess={handleAuthSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}