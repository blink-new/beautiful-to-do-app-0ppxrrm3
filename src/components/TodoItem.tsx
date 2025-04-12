
import { useState } from 'react'
import { Todo, useTodoStore, TodoPriority, TodoCategory } from '../lib/store'
import { Check, Pencil, Trash2, X, Calendar, GripVertical, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { cn } from '../lib/utils'
import { useToast } from '../hooks/use-toast'
import { format, isToday, isTomorrow, isPast, addDays } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Calendar as CalendarComponent } from './ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'

interface TodoItemProps {
  todo: Todo
  isDragging?: boolean
}

export function TodoItem({ todo, isDragging = false }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const [editPriority, setEditPriority] = useState<TodoPriority>(todo.priority)
  const [editCategory, setEditCategory] = useState<TodoCategory>(todo.category)
  const [editDueDate, setEditDueDate] = useState<Date | null>(todo.dueDate)
  
  const { toggleTodo, removeTodo, editTodo } = useTodoStore()
  const categories = useTodoStore((state) => state.categories)
  const { toast } = useToast()

  const handleToggle = async () => {
    await toggleTodo(todo.id)
    toast({
      title: todo.completed ? "Task marked as active" : "Task completed",
      description: todo.text,
    })
  }

  const handleRemove = async () => {
    await removeTodo(todo.id)
    toast({
      title: "Task removed",
      description: "The task has been deleted",
    })
  }

  const handleEdit = async () => {
    if (!editText.trim()) {
      toast({
        title: "Task cannot be empty",
        description: "Please enter a task description",
        variant: "destructive",
      })
      return
    }
    
    await editTodo(todo.id, editText, editPriority, editCategory, editDueDate)
    setIsEditing(false)
    
    toast({
      title: "Task updated",
      description: "Your task has been updated",
    })
  }

  const priorityColor = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    high: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800"
  }
  
  const categoryColor = {
    personal: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    work: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    shopping: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    health: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    other: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300"
  }
  
  const isOverdue = todo.dueDate && !todo.completed && isPast(new Date(todo.dueDate))
  
  function formatDueDate(date: Date | null) {
    if (!date) return null
    
    const dateObj = new Date(date)
    
    if (isToday(dateObj)) return 'Today'
    if (isTomorrow(dateObj)) return 'Tomorrow'
    
    return format(dateObj, 'MMM d')
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "p-4 rounded-lg shadow-sm border",
        isDragging ? "border-indigo-300 dark:border-indigo-700 shadow-md" : "",
        isOverdue ? "border-l-4 border-l-rose-500" : "",
        todo.completed 
          ? "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50" 
          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
      )}
    >
      {isEditing ? (
        <div className="space-y-4">
          <Input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full"
            autoFocus
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-slate-500 dark:text-slate-400 mb-2 block">Priority</Label>
              <RadioGroup 
                value={editPriority} 
                onValueChange={(value) => setEditPriority(value as TodoPriority)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id={`low-${todo.id}`} />
                  <Label htmlFor={`low-${todo.id}`} className="text-blue-500 font-medium">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id={`medium-${todo.id}`} />
                  <Label htmlFor={`medium-${todo.id}`} className="text-amber-500 font-medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id={`high-${todo.id}`} />
                  <Label htmlFor={`high-${todo.id}`} className="text-rose-500 font-medium">High</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label className="text-sm text-slate-500 dark:text-slate-400 mb-2 block">Category</Label>
              <Select value={editCategory} onValueChange={(value) => setEditCategory(value as TodoCategory)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label className="text-sm text-slate-500 dark:text-slate-400 mb-2 block">Due Date (Optional)</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {editDueDate ? format(editDueDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={editDueDate}
                    onSelect={setEditDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              {editDueDate && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setEditDueDate(null)}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setIsEditing(false)
                setEditText(todo.text)
                setEditPriority(todo.priority)
                setEditCategory(todo.category)
                setEditDueDate(todo.dueDate)
              }}
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleEdit}
            >
              <Check className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <div className="mt-1 flex-shrink-0 cursor-move text-slate-400">
            <GripVertical className="h-5 w-5" />
          </div>
          
          <button
            onClick={handleToggle}
            className={cn(
              "mt-1 flex-shrink-0 h-5 w-5 rounded-full border flex items-center justify-center",
              todo.completed 
                ? "bg-indigo-600 border-indigo-600 text-white" 
                : "border-slate-300 dark:border-slate-600"
            )}
          >
            {todo.completed && <Check className="h-3 w-3" />}
          </button>
          
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-slate-800 dark:text-slate-200 break-words",
              todo.completed && "line-through text-slate-500 dark:text-slate-400"
            )}>
              {todo.text}
            </p>
            
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline" className={cn(
                "text-xs font-medium",
                priorityColor[todo.priority]
              )}>
                {todo.priority}
              </Badge>
              
              <Badge variant="secondary" className={cn(
                "text-xs font-medium",
                categoryColor[todo.category]
              )}>
                {todo.category}
              </Badge>
              
              {todo.dueDate && (
                <Badge variant="outline" className={cn(
                  "text-xs font-medium flex items-center gap-1",
                  isOverdue ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300" : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
                )}>
                  <Clock className="h-3 w-3" />
                  {formatDueDate(todo.dueDate)}
                </Badge>
              )}
              
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {format(new Date(todo.createdAt), 'MMM d')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="h-8 w-8 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.li>
  )
}