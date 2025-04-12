
import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useTodoStore, TodoPriority, TodoCategory } from '../lib/store'
import { PlusCircle, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { useToast } from '../hooks/use-toast'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Calendar as CalendarComponent } from './ui/calendar'
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

export function AddTodo() {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<TodoPriority>('medium')
  const [category, setCategory] = useState<TodoCategory>('personal')
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  
  const addTodo = useTodoStore((state) => state.addTodo)
  const categories = useTodoStore((state) => state.categories)
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
    
    addTodo(text.trim(), priority, category, dueDate)
    setText('')
    setDueDate(null)
    
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
            onFocus={() => setIsExpanded(true)}
            className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
        
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
            <div>
              <Label className="text-sm text-slate-500 dark:text-slate-400 mb-2 block">Priority</Label>
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
            
            <div>
              <Label className="text-sm text-slate-500 dark:text-slate-400 mb-2 block">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as TodoCategory)}>
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
            
            <div>
              <Label className="text-sm text-slate-500 dark:text-slate-400 mb-2 block">Due Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </motion.div>
      </form>
    </motion.div>
  )
}