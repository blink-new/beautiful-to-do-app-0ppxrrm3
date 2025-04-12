
import { create } from 'zustand'
import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

export type TodoPriority = 'low' | 'medium' | 'high'
export type TodoCategory = 'personal' | 'work' | 'shopping' | 'health' | 'other'

export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  priority: TodoPriority
  category: TodoCategory
  dueDate: Date | null
  position: number
}

interface TodoState {
  todos: Todo[]
  categories: TodoCategory[]
  isLoading: boolean
  error: string | null
  
  // Auth related
  user: User | null
  setUser: (user: User | null) => void
  
  // CRUD operations
  fetchTodos: () => Promise<void>
  addTodo: (text: string, priority: TodoPriority, category: TodoCategory, dueDate: Date | null) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  removeTodo: (id: string) => Promise<void>
  editTodo: (id: string, text: string, priority: TodoPriority, category: TodoCategory, dueDate: Date | null) => Promise<void>
  reorderTodos: (startIndex: number, endIndex: number) => Promise<void>
  
  // Filtering and stats
  getFilteredTodos: (filter: string, category: TodoCategory | 'all', searchQuery: string) => Todo[]
  getCompletedCount: () => number
  getActiveCount: () => number
  getTodosByCategory: () => Record<TodoCategory, number>
  getOverdueTodos: () => Todo[]
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  categories: ['personal', 'work', 'shopping', 'health', 'other'],
  isLoading: false,
  error: null,
  user: null,
  
  setUser: (user) => set({ user }),
  
  fetchTodos: async () => {
    const { user } = get()
    if (!user) return
    
    set({ isLoading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('position', { ascending: true })
      
      if (error) throw error
      
      const todos = data.map(item => ({
        id: item.id,
        text: item.text,
        completed: item.completed,
        createdAt: new Date(item.created_at),
        priority: item.priority as TodoPriority,
        category: item.category as TodoCategory,
        dueDate: item.due_date ? new Date(item.due_date) : null,
        position: item.position
      }))
      
      set({ todos, isLoading: false })
    } catch (error) {
      console.error('Error fetching todos:', error)
      set({ error: 'Failed to fetch todos', isLoading: false })
    }
  },
  
  addTodo: async (text, priority, category, dueDate) => {
    const { user, todos } = get()
    if (!user) return
    
    const position = todos.length > 0 
      ? Math.max(...todos.map(t => t.position)) + 1 
      : 0
    
    // Optimistic update
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date(),
      priority,
      category,
      dueDate,
      position,
    }
    
    set({ todos: [newTodo, ...todos] })
    
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          user_id: user.id,
          text,
          priority,
          category,
          due_date: dueDate?.toISOString(),
          position
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Update with the actual data from the server
      set(state => ({
        todos: state.todos.map(todo => 
          todo.id === newTodo.id 
            ? {
                id: data.id,
                text: data.text,
                completed: data.completed,
                createdAt: new Date(data.created_at),
                priority: data.priority as TodoPriority,
                category: data.category as TodoCategory,
                dueDate: data.due_date ? new Date(data.due_date) : null,
                position: data.position
              }
            : todo
        )
      }))
    } catch (error) {
      console.error('Error adding todo:', error)
      // Revert optimistic update
      set(state => ({
        todos: state.todos.filter(todo => todo.id !== newTodo.id),
        error: 'Failed to add todo'
      }))
    }
  },
  
  toggleTodo: async (id) => {
    const { todos } = get()
    const todo = todos.find(t => t.id === id)
    if (!todo) return
    
    // Optimistic update
    set({
      todos: todos.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    })
    
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Error toggling todo:', error)
      // Revert optimistic update
      set({
        todos: todos.map(t => 
          t.id === id ? { ...t, completed: todo.completed } : t
        ),
        error: 'Failed to update todo'
      })
    }
  },
  
  removeTodo: async (id) => {
    const { todos } = get()
    const todoToRemove = todos.find(t => t.id === id)
    if (!todoToRemove) return
    
    // Optimistic update
    set({ todos: todos.filter(t => t.id !== id) })
    
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Error removing todo:', error)
      // Revert optimistic update
      set({
        todos: [...todos],
        error: 'Failed to remove todo'
      })
    }
  },
  
  editTodo: async (id, text, priority, category, dueDate) => {
    const { todos } = get()
    const originalTodo = todos.find(t => t.id === id)
    if (!originalTodo) return
    
    // Optimistic update
    set({
      todos: todos.map(t => 
        t.id === id 
          ? { ...t, text, priority, category, dueDate }
          : t
      )
    })
    
    try {
      const { error } = await supabase
        .from('todos')
        .update({
          text,
          priority,
          category,
          due_date: dueDate?.toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Error editing todo:', error)
      // Revert optimistic update
      set({
        todos: todos.map(t => 
          t.id === id ? originalTodo : t
        ),
        error: 'Failed to edit todo'
      })
    }
  },
  
  reorderTodos: async (startIndex, endIndex) => {
    const { todos } = get()
    
    // Create a copy of the todos array
    const newTodos = [...todos]
    const [removed] = newTodos.splice(startIndex, 1)
    newTodos.splice(endIndex, 0, removed)
    
    // Update positions
    const updatedTodos = newTodos.map((todo, index) => ({
      ...todo,
      position: index
    }))
    
    // Optimistic update
    set({ todos: updatedTodos })
    
    try {
      // Update positions in the database
      const updates = updatedTodos.map(todo => ({
        id: todo.id,
        position: todo.position
      }))
      
      // Batch update all positions
      for (const update of updates) {
        const { error } = await supabase
          .from('todos')
          .update({ position: update.position })
          .eq('id', update.id)
        
        if (error) throw error
      }
    } catch (error) {
      console.error('Error reordering todos:', error)
      // Revert optimistic update
      set({
        todos: [...todos],
        error: 'Failed to reorder todos'
      })
    }
  },
  
  getFilteredTodos: (filter, category, searchQuery) => {
    const { todos } = get()
    
    return todos
      .filter((todo) => {
        // Filter by status
        if (filter === 'active' && todo.completed) return false
        if (filter === 'completed' && !todo.completed) return false
        
        // Filter by category
        if (category !== 'all' && todo.category !== category) return false
        
        // Filter by search query
        if (searchQuery && !todo.text.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false
        }
        
        return true
      })
      .sort((a, b) => a.position - b.position)
  },
  
  getCompletedCount: () => {
    return get().todos.filter(todo => todo.completed).length
  },
  
  getActiveCount: () => {
    return get().todos.filter(todo => !todo.completed).length
  },
  
  getTodosByCategory: () => {
    const { todos } = get()
    return todos.reduce((acc, todo) => {
      if (!todo.completed) {
        acc[todo.category] = (acc[todo.category] || 0) + 1
      }
      return acc
    }, {} as Record<TodoCategory, number>)
  },
  
  getOverdueTodos: () => {
    const { todos } = get()
    const now = new Date()
    return todos.filter(todo => 
      !todo.completed && 
      todo.dueDate && 
      new Date(todo.dueDate) < now
    )
  }
}))