
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  addTodo: (text: string, priority: TodoPriority, category: TodoCategory, dueDate: Date | null) => void
  toggleTodo: (id: string) => void
  removeTodo: (id: string) => void
  editTodo: (id: string, text: string, priority: TodoPriority, category: TodoCategory, dueDate: Date | null) => void
  reorderTodos: (startIndex: number, endIndex: number) => void
  getFilteredTodos: (filter: string, category: TodoCategory | 'all', searchQuery: string) => Todo[]
  getCompletedCount: () => number
  getActiveCount: () => number
  getTodosByCategory: () => Record<TodoCategory, number>
  getOverdueTodos: () => Todo[]
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],
      categories: ['personal', 'work', 'shopping', 'health', 'other'],
      
      addTodo: (text, priority, category, dueDate) => 
        set((state) => {
          const position = state.todos.length > 0 
            ? Math.max(...state.todos.map(t => t.position)) + 1 
            : 0
            
          return {
            todos: [
              {
                id: crypto.randomUUID(),
                text,
                completed: false,
                createdAt: new Date(),
                priority,
                category,
                dueDate,
                position,
              },
              ...state.todos,
            ],
          }
        }),
        
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
        
      editTodo: (id, text, priority, category, dueDate) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, text, priority, category, dueDate } : todo
          ),
        })),
        
      reorderTodos: (startIndex, endIndex) =>
        set((state) => {
          const result = Array.from(state.todos);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          
          // Update positions
          return {
            todos: result.map((todo, index) => ({
              ...todo,
              position: index,
            })),
          };
        }),
        
      getFilteredTodos: (filter, category, searchQuery) => {
        const { todos } = get();
        
        return todos
          .filter((todo) => {
            // Filter by status
            if (filter === 'active' && todo.completed) return false;
            if (filter === 'completed' && !todo.completed) return false;
            
            // Filter by category
            if (category !== 'all' && todo.category !== category) return false;
            
            // Filter by search query
            if (searchQuery && !todo.text.toLowerCase().includes(searchQuery.toLowerCase())) {
              return false;
            }
            
            return true;
          })
          .sort((a, b) => a.position - b.position);
      },
      
      getCompletedCount: () => {
        return get().todos.filter(todo => todo.completed).length;
      },
      
      getActiveCount: () => {
        return get().todos.filter(todo => !todo.completed).length;
      },
      
      getTodosByCategory: () => {
        const { todos } = get();
        return todos.reduce((acc, todo) => {
          if (!todo.completed) {
            acc[todo.category] = (acc[todo.category] || 0) + 1;
          }
          return acc;
        }, {} as Record<TodoCategory, number>);
      },
      
      getOverdueTodos: () => {
        const { todos } = get();
        const now = new Date();
        return todos.filter(todo => 
          !todo.completed && 
          todo.dueDate && 
          new Date(todo.dueDate) < now
        );
      }
    }),
    {
      name: 'todo-storage',
    }
  )
)