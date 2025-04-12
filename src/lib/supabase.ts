
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Get the Supabase URL and anon key from environment variables or use fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ffudgvexqjwwgkmwhtxb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdWRndmV4cWp3d2drbXdodHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNDg2NjYsImV4cCI6MjA1OTcyNDY2Nn0.V-YqIb3HwInzL5CZ8hCtvFYxEQMGl44mLCOb_rD3dJ8'

// Create Supabase client with custom options
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Enables detecting auth redirects
    // Remove flowType to use the default implicit flow
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
  // Add debug logs in development
  ...(import.meta.env.DEV ? { debug: true } : {}),
})

// Helper function to check if a user is authenticated
export async function isAuthenticated() {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error checking authentication:', error)
      return false
    }
    return !!data.session
  } catch (error) {
    console.error('Error in isAuthenticated:', error)
    return false
  }
}

// Helper function to get the current user
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error getting current user:', error)
      return null
    }
    return data.user
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

// Direct sign in helper (for debugging)
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('Sign in error:', error)
      return { user: null, error: error.message }
    }
    
    return { user: data.user, error: null }
  } catch (error) {
    console.error('Exception during sign in:', error)
    return { user: null, error: 'An unexpected error occurred' }
  }
}