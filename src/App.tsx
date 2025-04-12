
import { Toaster } from './components/ui/toaster'
import { TodoList } from './components/TodoList'
import { AddTodo } from './components/AddTodo'
import { Header } from './components/Header'
import { motion } from 'framer-motion'

function App() {
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