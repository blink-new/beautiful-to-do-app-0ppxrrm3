
import { useTodoStore, TodoCategory } from '../lib/store'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export function StatsView() {
  const todos = useTodoStore((state) => state.todos)
  const getCompletedCount = useTodoStore((state) => state.getCompletedCount)
  const getActiveCount = useTodoStore((state) => state.getActiveCount)
  const getTodosByCategory = useTodoStore((state) => state.getTodosByCategory)
  
  const completedCount = getCompletedCount()
  const activeCount = getActiveCount()
  const todosByCategory = getTodosByCategory()
  
  // Prepare data for pie chart
  const statusData = [
    { name: 'Active', value: activeCount, color: '#4f46e5' },
    { name: 'Completed', value: completedCount, color: '#10b981' },
  ]
  
  // Prepare data for category chart
  const categoryData = Object.entries(todosByCategory).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count,
    color: getCategoryColor(category as TodoCategory),
  }))
  
  // Calculate completion rate
  const completionRate = todos.length > 0 
    ? Math.round((completedCount / todos.length) * 100) 
    : 0
  
  // Get tasks completed today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const completedToday = todos.filter(todo => 
    todo.completed && 
    new Date(todo.createdAt) >= today
  ).length
  
  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Completion Rate</h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{completionRate}%</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Completed Today</h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{completedToday}</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Task Status</h3>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {categoryData.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Tasks by Category</h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

function getCategoryColor(category: TodoCategory): string {
  const colors = {
    personal: '#8b5cf6', // purple
    work: '#3b82f6',     // blue
    shopping: '#f59e0b',  // amber
    health: '#10b981',   // emerald
    other: '#6b7280',    // gray
  }
  
  return colors[category]
}