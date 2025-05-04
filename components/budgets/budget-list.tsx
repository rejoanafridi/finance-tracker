"use client"

import { useState } from "react"
import { useBudgets, type Budget } from "@/hooks/use-budgets"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Trash2 } from "lucide-react"
import { AddBudgetDialog } from "./add-budget-dialog"
import { EditBudgetDialog } from "./edit-budget-dialog"
import { DeleteBudgetDialog } from "./delete-budget-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "./empty-state"

export function BudgetList() {
  const [period, setPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly")
  const { budgets, isLoading } = useBudgets(period)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)

  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget)
    setShowEditDialog(true)
  }

  const handleDelete = (budget: Budget) => {
    setSelectedBudget(budget)
    setShowDeleteDialog(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Budget Limits</CardTitle>
          <CardDescription>Set spending limits for each category</CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Tabs value={period} onValueChange={(value) => setPeriod(value as "monthly" | "quarterly" | "yearly")}>
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Budget
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <BudgetListSkeleton />
        ) : budgets.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget: any) => (
                <TableRow key={budget._id}>
                  <TableCell>
                    <Badge variant="outline">{budget.category}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(budget.amount)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{budget.period}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleEdit({
                            id: budget._id,
                            category: budget.category,
                            amount: budget.amount,
                            period: budget.period,
                            startDate: budget.startDate,
                            endDate: budget.endDate,
                          })
                        }
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleDelete({
                            id: budget._id,
                            category: budget.category,
                            amount: budget.amount,
                            period: budget.period,
                            startDate: budget.startDate,
                            endDate: budget.endDate,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState onAddClick={() => setShowAddDialog(true)} />
        )}
      </CardContent>
      <AddBudgetDialog open={showAddDialog} onOpenChange={setShowAddDialog} defaultPeriod={period} />
      {selectedBudget && (
        <>
          <EditBudgetDialog open={showEditDialog} onOpenChange={setShowEditDialog} budget={selectedBudget} />
          <DeleteBudgetDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} budget={selectedBudget} />
        </>
      )}
    </Card>
  )
}

function BudgetListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Skeleton className="h-4 w-24" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead className="text-right">
              <Skeleton className="h-4 w-16 ml-auto" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 3 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-6 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20" />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
