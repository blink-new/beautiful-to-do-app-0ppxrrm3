
import { useState } from 'react'
import { Todo, useTodoStore, TodoPriority } from '../lib/store'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { cn } from '../lib/utils'
import { useToast } from '../hooks/use-toast'

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const [editPriority, setEditPriority] = useState<TodoPriority>(todo.priority)
  
  const { toggleTodo, removeTodo, editTodo } = useTodoStore()
  const { toast } = useToast()

  const handleToggle = () => {
    toggleTodo(todo.id)
    toast({
      title: todo.completed ? "Task marked as active" : "Task completed",
      description: todo.text,
    })
  }

  const handleRemove = () => {
    removeTodo(todo.id)
    toast({
      title: "Task removed",
      description: "The task has been deleted",
    })
  }

  const handleEdit = () => {
    if (!editText.trim()) {
      toast({
        title: "Task cannot be empty",
        description: "Please enter a task description",
        variant: "destructive",
      })
      return
    }
    
    editTodo(todo.id, editText, editPriority)
    setIsEditing(false)
    
    toast({
      title: "Task updated",
      description: "Your task has been updated",
    })
  }

  const priorityColor = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    high: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
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
        todo.completed 
          ? "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50" 
          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
      )}
    >
      {isEditing ? (
        <div className="space-y-3">
          <Input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full"
            autoFocus
          />
          
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
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setIsEditing(false)
                setEditText(todo.text)
                setEditPriority(todo.priority)
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
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1">
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
              
              <div className="flex items-center gap-2 mt-2">
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  priorityColor[todo.priority]
                )}>
                  {todo.priority}
                </span>
                
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(todo.createdAt).toLocaleDateString()}
                </span>
              </div>
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