
import { useTodoStore, Todo as TodoType, TodoCategory } from '../lib/store'
import { TodoItem } from './TodoItem'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { ListFilter, Search, X } from 'lucide-react'
import { EmptyState } from './EmptyState'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

type FilterType = 'all' | 'active' | 'completed'

export function TodoList() {
  const todos = useTodoStore((state) => state.todos)
  const categories = useTodoStore((state) => state.categories)
  const getFilteredTodos = useTodoStore((state) => state.getFilteredTodos)
  const reorderTodos = useTodoStore((state) => state.reorderTodos)
  
  const [filter, setFilter] = useState<FilterType>('all')
  const [categoryFilter, setCategoryFilter] = useState<TodoCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const completedCount = todos.filter(todo => todo.completed).length
  const activeCount = todos.length - completedCount
  
  const filteredTodos = getFilteredTodos(filter, categoryFilter, searchQuery)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = filteredTodos.findIndex(todo => todo.id === active.id)
      const newIndex = filteredTodos.findIndex(todo => todo.id === over.id)
      
      reorderTodos(oldIndex, newIndex)
    }
  }
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        document.getElementById('search-input')?.focus()
      }
      
      // Ctrl/Cmd + 1/2/3 to switch filters
      if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault()
        setFilter('all')
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault()
        setFilter('active')
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '3') {
        e.preventDefault()
        setFilter('completed')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-2">
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
        
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="search-input"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as TodoCategory | 'all')}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredTodos.length === 0 ? (
        <EmptyState 
          title={
            searchQuery 
              ? "No matching tasks" 
              : filter === 'all' 
                ? "No tasks yet" 
                : filter === 'active' 
                  ? "No active tasks" 
                  : "No completed tasks"
          }
          description={
            searchQuery 
              ? "Try a different search term or filter"
              : filter === 'all' 
                ? "Add a new task to get started" 
                : filter === 'active' 
                  ? "All your tasks are completed" 
                  : "Complete some tasks to see them here"
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={filteredTodos.map(todo => todo.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {filteredTodos.map((todo) => (
                  <SortableTodoItem key={todo.id} todo={todo} />
                ))}
              </AnimatePresence>
            </ul>
          </SortableContext>
        </DndContext>
      )}
      
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-6 text-center">
        <p>Keyboard shortcuts: <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">Ctrl/⌘+F</kbd> to search, 
        <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded ml-1">Ctrl/⌘+1</kbd> all, 
        <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded ml-1">Ctrl/⌘+2</kbd> active, 
        <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded ml-1">Ctrl/⌘+3</kbd> completed</p>
      </div>
    </motion.div>
  )
}

function SortableTodoItem({ todo }: { todo: TodoType }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id })
  
  const style = {
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as const,
  }
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TodoItem todo={todo} isDragging={isDragging} />
    </div>
  )
}