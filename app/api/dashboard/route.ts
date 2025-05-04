import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Transaction } from "@/models/transaction"
import { auth } from "@/lib/auth"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"

export async function GET(req: Request) {
  try {
    await connectToDatabase()
    const user = await auth()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all transactions for the user
    const transactions = await Transaction.find({ userId: user.id }).sort({ date: -1 })

    // Calculate totals
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpenses

    // Get recent transactions (last 5)
    const recentTransactions = transactions.slice(0, 5)

    // Calculate monthly data for the last 6 months
    const monthlyData = []
    const today = new Date()

    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(today, i))
      const monthEnd = endOfMonth(subMonths(today, i))
      const monthName = format(monthStart, "MMM")

      const monthTransactions = transactions.filter((t) => {
        const date = new Date(t.date)
        return date >= monthStart && date <= monthEnd
      })

      const income = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

      const expense = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

      monthlyData.push({
        month: monthName,
        income,
        expense,
      })
    }

    // Calculate category summary for expenses
    const categorySummary = transactions
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, t) => {
          const category = t.category
          acc[category] = (acc[category] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>,
      )

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      balance,
      recentTransactions,
      monthlyData,
      categorySummary,
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
