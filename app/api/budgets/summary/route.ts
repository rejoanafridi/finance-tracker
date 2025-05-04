import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Budget } from "@/models/budget"
import { Transaction } from "@/models/transaction"
import { auth } from "@/lib/auth"
import { startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns"

// Get budget summary with spending progress
export async function GET(req: Request) {
  try {
    await connectToDatabase()
    const user = await auth()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "monthly"

    // Determine date range based on period
    const now = new Date()
    let startDate, endDate

    switch (period) {
      case "monthly":
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case "quarterly":
        startDate = startOfQuarter(now)
        endDate = endOfQuarter(now)
        break
      case "yearly":
        startDate = startOfYear(now)
        endDate = endOfYear(now)
        break
      default:
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
    }

    // Get all budgets for the period
    const budgets = await Budget.find({
      userId: user.id,
      period,
    })

    // Get all expense transactions for the date range
    const transactions = await Transaction.find({
      userId: user.id,
      type: "expense",
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })

    // Calculate spending by category
    const spendingByCategory = transactions.reduce((acc: Record<string, number>, transaction: any) => {
      const category = transaction.category
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += transaction.amount
      return acc
    }, {})

    // Create budget summary with spending progress
    const budgetSummary = budgets.map((budget: any) => {
      const spent = spendingByCategory[budget.category] || 0
      const remaining = budget.amount - spent
      const percentage = budget.amount > 0 ? Math.min(100, (spent / budget.amount) * 100) : 0

      return {
        id: budget._id,
        category: budget.category,
        budgeted: budget.amount,
        spent,
        remaining,
        percentage,
        status: percentage >= 100 ? "exceeded" : percentage >= 80 ? "warning" : "good",
      }
    })

    // Calculate totals
    const totalBudgeted = budgets.reduce((sum: number, budget: any) => sum + budget.amount, 0)
    const totalSpent = Object.values(spendingByCategory).reduce((sum: number, amount: number) => sum + amount, 0)
    const totalRemaining = totalBudgeted - totalSpent
    const totalPercentage = totalBudgeted > 0 ? Math.min(100, (totalSpent / totalBudgeted) * 100) : 0

    return NextResponse.json({
      period,
      startDate,
      endDate,
      budgets: budgetSummary,
      totals: {
        budgeted: totalBudgeted,
        spent: totalSpent,
        remaining: totalRemaining,
        percentage: totalPercentage,
        status: totalPercentage >= 100 ? "exceeded" : totalPercentage >= 80 ? "warning" : "good",
      },
    })
  } catch (error) {
    console.error("Error fetching budget summary:", error)
    return NextResponse.json({ error: "Failed to fetch budget summary" }, { status: 500 })
  }
}
