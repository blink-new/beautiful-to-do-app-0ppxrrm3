
import { motion } from 'framer-motion'
import { ClipboardList } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-16 px-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-slate-100 dark:bg-slate-800 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <ClipboardList className="h-10 w-10 text-slate-400 dark:text-slate-500" />
      </motion.div>
      <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-2">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        {description}
      </p>
    </motion.div>
  )
}