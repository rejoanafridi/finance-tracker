"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Transaction } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { EditTransactionDialog } from "./edit-transaction-dialog"
import { DeleteTransactionDialog } from "./delete-transaction-dialog"
import { ArrowLeft, Calendar, Edit, Tag, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

interface TransactionDetailProps {
  transaction: Transaction
}

export function TransactionDetail({ transaction }: TransactionDetailProps) {
  const router = useRouter()
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleBack = () => {
    router.back()
  }

  const setEditDialog = (open: boolean) => {
    setShowEditDialog(open)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Button variant="ghost" onClick={handleBack} className="mb-6 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Transactions
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">{transaction.description}</CardTitle>
          <Badge variant={transaction.type === "income" ? "default" : "secondary"}>{transaction.type}</Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className={`text-2xl font-bold ${transaction.type === "income" ? "text-green-500" : "text-red-500"}`}>
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p>{formatDate(transaction.date)}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Category</p>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">{transaction.category}</Badge>
              </div>
            </div>

            {transaction.createdAt && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm">{formatDate(transaction.createdAt)}</p>
              </div>
            )}

            {transaction.updatedAt && transaction.updatedAt !== transaction.createdAt && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm">{formatDate(transaction.updatedAt)}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </CardFooter>
      </Card>

      <EditTransactionDialog open={showEditDialog} onOpenChange={setShowEditDialog} transaction={transaction} />

      <DeleteTransactionDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} transaction={transaction} />
    </motion.div>
  )
}
