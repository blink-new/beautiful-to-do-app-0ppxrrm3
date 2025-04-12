
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { User } from '@supabase/supabase-js'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { LogOut, Settings, User as UserIcon, AlertCircle } from 'lucide-react'
import { useToast } from '../../hooks/use-toast'

interface UserMenuProps {
  user: User
  onSignOut: () => void
}

interface Profile {
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function getProfile() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Check if the profile exists
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle()

        if (fetchError) {
          throw fetchError
        }

        if (data) {
          setProfile(data)
        } else {
          // If profile doesn't exist, create one
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: user.id,
                username: user.email,
                full_name: user.user_metadata?.full_name || null,
                avatar_url: user.user_metadata?.avatar_url || null
              }
            ])
            .select('username, full_name, avatar_url')
            .single()

          if (insertError) {
            throw insertError
          }

          setProfile(newProfile)
        }
      } catch (error) {
        console.error('Error fetching/creating profile:', error)
        setError('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    getProfile()
  }, [user.id, user.email, user.user_metadata])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      onSignOut()
      toast({
        title: 'Signed out successfully',
        description: 'You have been signed out of your account',
      })
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: 'Error signing out',
        description: 'There was a problem signing out',
        variant: 'destructive',
      })
    }
  }

  // Fallback to user email if profile data is not available
  const displayName = profile?.full_name || profile?.username || user.email || 'User'
  const initials = displayName.substring(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            {isLoading ? (
              <AvatarFallback className="animate-pulse bg-slate-200 dark:bg-slate-700"></AvatarFallback>
            ) : (
              <>
                <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </>
            )}
          </Avatar>
          {error && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
              <AlertCircle className="h-3 w-3 text-white" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            {error && (
              <p className="text-xs text-red-500 mt-1">
                {error}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}