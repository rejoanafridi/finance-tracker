"use client"

import { Button } from "@/components/ui/button"
import { PieChart, Plus } from "lucide-react"
import { motion } from "framer-motion"

interface EmptyStateProps {
  onAddClick: () => void
  title?: string
  description?: string
}

export function EmptyState({
  onAddClick,
  title = "No budgets set",
  description = "Start managing your finances by setting up your first budget",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <PieChart className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <Button onClick={onAddClick} className="mt-6">
        <Plus className="mr-2 h-4 w-4" />
        Add Budget
      </Button>
    </motion.div>
  )
}
