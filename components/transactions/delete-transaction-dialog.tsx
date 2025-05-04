"use client"

import { useFinance } from "@/context/finance-context"
import type { Transaction } from "@/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DeleteTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction
}

export function DeleteTransactionDialog({ open, onOpenChange, transaction }: DeleteTransactionDialogProps) {
  const { deleteTransaction } = useFinance()

  const handleDelete = () => {
    deleteTransaction(transaction.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Transaction</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm">
            <span className="font-medium">Description:</span> {transaction.description}
          </p>
          <p className="text-sm">
            <span className="font-medium">Amount:</span> ${transaction.amount.toFixed(2)}
          </p>
          <p className="text-sm">
            <span className="font-medium">Category:</span> {transaction.category}
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
