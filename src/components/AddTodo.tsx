
import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useTodoStore, TodoPriority } from '../lib/store'
import { PlusCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { useToast } from '../hooks/use-toast'

export function AddTodo() {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<TodoPriority>('medium')
  const addTodo = useTodoStore((state) => state.addTodo)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!text.trim()) {
      toast({
        title: "Task cannot be empty",
        description: "Please enter a task description",
        variant: "destructive",
      })
      return
    }
    
    addTodo(text.trim(), priority)
    setText('')
    
    toast({
      title: "Task added",
      description: "Your new task has been added",
    })
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mb-8"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Add a new task..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <RadioGroup 
            value={priority} 
            onValueChange={(value) => setPriority(value as TodoPriority)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="low" />
              <Label htmlFor="low" className="text-blue-500 font-medium">Low</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium" className="text-amber-500 font-medium">Medium</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="high" />
              <Label htmlFor="high" className="text-rose-500 font-medium">High</Label>
            </div>
          </RadioGroup>
        </div>
      </form>
    </motion.div>
  )
}