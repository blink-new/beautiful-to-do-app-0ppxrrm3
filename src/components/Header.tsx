
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false)

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

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-bold text-slate-800 dark:text-white"
        >
          Beautiful Tasks
        </motion.h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>
      </div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-slate-600 dark:text-slate-400 mt-2"
      >
        Organize your day with style
      </motion.p>
    </header>
  )
}