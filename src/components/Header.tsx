
import { Moon, Sun, BarChart2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { useTodoStore } from '../lib/store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { StatsView } from './StatsView'
import { useAuth } from './auth/AuthProvider'

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const getActiveCount = useTodoStore((state) => state.getActiveCount)
  const getCompletedCount = useTodoStore((state) => state.getCompletedCount)
  const getOverdueTodos = useTodoStore((state) => state.getOverdueTodos)
  const { user } = useAuth()

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    setIsDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('darkMode', String(newMode))
    
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const activeCount = getActiveCount()
  const completedCount = getCompletedCount()
  const overdueTodos = getOverdueTodos()

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Beautiful Tasks
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {user ? `Organize your day with style` : 'A beautiful task management app'}
          </p>
        </motion.div>
        
        <div className="flex items-center gap-2">
          {user && (
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="bg-white dark:bg-slate-800"
                >
                  <BarChart2 className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Productivity Stats</DialogTitle>
                </DialogHeader>
                <StatsView />
              </DialogContent>
            </Dialog>
          )}
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
        </div>
      </div>
      
      {user && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-2 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
            <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">{activeCount}</p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-2 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{completedCount}</p>
          </div>
          
          {overdueTodos.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-2 shadow-sm border border-rose-200 dark:border-rose-900">
              <p className="text-sm text-rose-500 dark:text-rose-400">Overdue</p>
              <p className="text-2xl font-semibold text-rose-600 dark:text-rose-400">{overdueTodos.length}</p>
            </div>
          )}
        </motion.div>
      )}
    </header>
  )
}