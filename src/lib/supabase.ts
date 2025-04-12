
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ffudgvexqjwwgkmwhtxb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdWRndmV4cWp3d2drbXdodHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNDg2NjYsImV4cCI6MjA1OTcyNDY2Nn0.V-YqIb3HwInzL5CZ8hCtvFYxEQMGl44mLCOb_rD3dJ8'

// Create Supabase client with custom fetch options
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
})

// Helper function to check if a user is authenticated
export async function isAuthenticated() {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error checking authentication:', error)
    return false
  }
  return !!data.session
}