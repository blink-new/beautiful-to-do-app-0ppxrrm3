
import { useTodoStore, Todo as TodoType } from '../lib/store'
import { TodoItem } from './TodoItem'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Button } from './ui/button'
import { ListFilter } from 'lucide-react'
import { EmptyState } from './EmptyState'

type FilterType = 'all' | 'active' | 'completed'

export function TodoList() {
  const todos = useTodoStore((state) => state.todos)
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'all') return true
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const completedCount = todos.filter(todo => todo.completed).length
  const activeCount = todos.length - completedCount

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
          Your Tasks
        </h2>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span>{activeCount} active</span>
          <span>•</span>
          <span>{completedCount} completed</span>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('all')}
          className="text-xs"
        >
          All
        </Button>
        <Button 
          variant={filter === 'active' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('active')}
          className="text-xs"
        >
          Active
        </Button>
        <Button 
          variant={filter === 'completed' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('completed')}
          className="text-xs"
        >
          Completed
        </Button>
      </div>

      {filteredTodos.length === 0 ? (
        <EmptyState 
          title={
            filter === 'all' 
              ? "No tasks yet" 
              : filter === 'active' 
                ? "No active tasks" 
                : "No completed tasks"
          }
          description={
            filter === 'all' 
              ? "Add a new task to get started" 
              : filter === 'active' 
                ? "All your tasks are completed" 
                : "Complete some tasks to see them here"
          }
        />
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {filteredTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </motion.div>
  )
}