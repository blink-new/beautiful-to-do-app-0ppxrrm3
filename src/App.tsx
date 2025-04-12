
import { Toaster } from './components/ui/toaster'
import { TodoList } from './components/TodoList'
import { AddTodo } from './components/AddTodo'
import { Header } from './components/Header'
import { motion } from 'framer-motion'
import { useEffect } from 'react'

function App() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 max-w-3xl"
      >
        <Header />
        <AddTodo />
        <TodoList />
        <Toaster />
      </motion.div>
    </div>
  )
}

export default App