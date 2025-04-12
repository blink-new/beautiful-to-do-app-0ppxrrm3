
import { Toaster } from './components/ui/toaster'
import { TodoList } from './components/TodoList'
import { AddTodo } from './components/AddTodo'
import { Header } from './components/Header'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './components/auth/AuthProvider'
import { AuthModal } from './components/auth/AuthModal'
import { UserMenu } from './components/auth/UserMenu'
import { useTodoStore } from './lib/store'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const { user, isLoading: authLoading, refreshSession } = useAuth()
  const { fetchTodos, setUser, isLoading: todosLoading } = useTodoStore()
  const [isInitialized, setIsInitialized] = useState(false)

  // Set user in store when auth state changes
  useEffect(() => {
    setUser(user)
    
    if (user) {
      fetchTodos().catch(error => {
        console.error('Error fetching todos:', error)
      })
    }
    
    setIsInitialized(true)
  }, [user, setUser, fetchTodos])

  // Add keyboard shortcut for new task
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N for new task
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        document.querySelector('input[placeholder="Add a new task..."]')?.focus()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const isLoading = authLoading || (user && todosLoading && !isInitialized)

  const handleSignOut = () => {
    // Reset the store's user state
    setUser(null)
  }

  const handleAuthSuccess = async () => {
    // Refresh the session to get the latest user data
    await refreshSession()
    // Fetch todos for the newly authenticated user
    await fetchTodos()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-4 max-w-3xl">
        <div className="flex justify-end mb-4">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          ) : user ? (
            <UserMenu user={user} onSignOut={handleSignOut} />
          ) : (
            <AuthModal onAuthSuccess={handleAuthSuccess} />
          )}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <Header />
          
          {user ? (
            <>
              <AddTodo />
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : (
                <TodoList />
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                Welcome to Beautiful Tasks
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Sign in to start managing your tasks with style
              </p>
              <AuthModal onAuthSuccess={handleAuthSuccess} />
            </div>
          )}
          
          <Toaster />
        </motion.div>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App