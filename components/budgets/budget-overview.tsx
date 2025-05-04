"use client"

import { useBudgets, type BudgetSummaryResponse } from "@/hooks/use-budgets"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { useState } from "react"
import { motion } from "framer-motion"
import { useFinance } from "@/context/finance-context"

export function BudgetOverview() {
  const [period, setPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly")
  const { budgetSummary, isLoading } = useBudgets(period)
  const { currency } = useFinance()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "exceeded":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      default:
        return "bg-green-500"
    }
  }

  if (isLoading) {
    return <BudgetOverviewSkeleton />
  }

  const summary = budgetSummary as BudgetSummaryResponse

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>
              {summary?.startDate && summary?.endDate
                ? `${format(new Date(summary.startDate), "MMM d, yyyy")} - ${format(
                    new Date(summary.endDate),
                    "MMM d, yyyy",
                  )}`
                : "Track your spending against your budget"}
            </CardDescription>
          </div>
          <Tabs value={period} onValueChange={(value) => setPeriod(value as "monthly" | "quarterly" | "yearly")}>
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {summary?.totals ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Budget</span>
                <span className="text-sm font-medium">{formatCurrency(summary.totals.budgeted, currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Spent</span>
                <span className="text-sm font-medium">{formatCurrency(summary.totals.spent, currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Remaining</span>
                <span
                  className={`text-sm font-medium ${summary.totals.remaining < 0 ? "text-red-500" : "text-green-500"}`}
                >
                  {formatCurrency(summary.totals.remaining, currency)
                </span>
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-medium">{Math.round(summary.totals.percentage)}%</span>
                </div>
                <Progress
                  value={summary.totals.percentage}
                  className="h-2"
                  indicatorClassName={getStatusColor(summary.totals.status)}
                />
              </div>
            </div>

            {summary.budgets.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No budgets set for this period</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Category Breakdown</h3>
                <div className="space-y-3">
                  {summary.budgets.map((budget) => (
                    <div key={budget.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{budget.category}</span>
                        <span className="text-sm">
                          {formatCurrency(budget.spent, currency)} / {formatCurrency(budget.budgeted, currency)
                        </span>
                      </div>
                      <Progress
                        value={budget.percentage}
                        className="h-1.5"
                        indicatorClassName={getStatusColor(budget.status)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No budget data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BudgetOverviewSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
          <Skeleton className="h-10 w-64" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-1.5 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
