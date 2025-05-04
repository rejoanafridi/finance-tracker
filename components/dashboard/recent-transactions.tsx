"use client"

import { useDashboard } from "@/hooks/use-dashboard"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Plus } from "lucide-react"
import Link from "next/link"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"
import { useState, useEffect } from "react"

export function RecentTransactions() {
  const { dashboardData, isLoading } = useDashboard()
  const recentTransactions = dashboardData?.recentTransactions || []
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get the 5 most recent transactions
  // const recentTransactions = [...transactions]
  //   .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  //   .slice(0, 5)

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAddDialog(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={transaction.type === "income" ? "outline" : "secondary"}>
                    {transaction.category}
                  </Badge>
                  <span className={transaction.type === "income" ? "text-green-500" : "text-red-500"}>
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="w-full" asChild>
          <Link href="/transactions">
            View all transactions
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
      <AddTransactionDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </Card>
  )
}
