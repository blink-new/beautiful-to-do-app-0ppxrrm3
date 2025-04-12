
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { User } from '@supabase/supabase-js'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { LogOut, Settings, User as UserIcon } from 'lucide-react'
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
  const { toast } = useToast()

  useEffect(() => {
    async function getProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', user.id)
          .single()

        if (error) {
          throw error
        }

        setProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    getProfile()
  }, [user.id])

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

  const displayName = profile?.full_name || profile?.username || user.email || 'User'
  const initials = displayName.substring(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
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