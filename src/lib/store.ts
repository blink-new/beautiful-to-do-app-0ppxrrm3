
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TodoPriority = 'low' | 'medium' | 'high'

export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  priority: TodoPriority
}

interface TodoState {
  todos: Todo[]
  addTodo: (text: string, priority: TodoPriority) => void
  toggleTodo: (id: string) => void
  removeTodo: (id: string) => void
  editTodo: (id: string, text: string, priority: TodoPriority) => void
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      todos: [],
      addTodo: (text, priority) => 
        set((state) => ({
          todos: [
            {
              id: crypto.randomUUID(),
              text,
              completed: false,
              createdAt: new Date(),
              priority,
            },
            ...state.todos,
          ],
        })),
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          ),
        })),
      removeTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),
      editTodo: (id, text, priority) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, text, priority } : todo
          ),
        })),
    }),
    {
      name: 'todo-storage',
    }
  )
)