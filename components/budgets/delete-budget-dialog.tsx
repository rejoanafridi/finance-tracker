"use client"

import { useBudgets, type Budget } from "@/hooks/use-budgets"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface DeleteBudgetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budget: Budget
}

export function DeleteBudgetDialog({ open, onOpenChange, budget }: DeleteBudgetDialogProps) {
  const { deleteBudget } = useBudgets()

  const handleDelete = () => {
    deleteBudget(budget.id, {
      onSuccess: () => {
        toast.success("Budget deleted successfully")
        onOpenChange(false)
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to delete budget")
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Budget</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this budget? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm">
            <span className="font-medium">Category:</span> {budget.category}
          </p>
          <p className="text-sm">
            <span className="font-medium">Amount:</span> {formatCurrency(budget.amount)}
          </p>
          <p className="text-sm">
            <span className="font-medium">Period:</span> {budget.period}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
