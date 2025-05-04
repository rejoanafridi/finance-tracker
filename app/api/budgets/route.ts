import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Budget } from "@/models/budget"
import { auth } from "@/lib/auth"
import { z } from "zod"

const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  period: z.enum(["monthly", "quarterly", "yearly"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

// Get all budgets for the authenticated user
export async function GET(req: Request) {
  try {
    await connectToDatabase()
    const user = await auth()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "monthly"

    const budgets = await Budget.find({
      userId: user.id,
      period,
    }).sort({ category: 1 })

    return NextResponse.json(budgets)
  } catch (error) {
    console.error("Error fetching budgets:", error)
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 })
  }
}

// Create a new budget
export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const user = await auth()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    // Validate input
    const result = budgetSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    // Check if budget already exists for this category and period
    const existingBudget = await Budget.findOne({
      userId: user.id,
      category: data.category,
      period: data.period,
    })

    if (existingBudget) {
      return NextResponse.json({ error: "Budget already exists for this category and period" }, { status: 400 })
    }

    const budget = new Budget({
      ...data,
      userId: user.id,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : null,
    })

    await budget.save()
    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error("Error creating budget:", error)
    return NextResponse.json({ error: "Failed to create budget" }, { status: 500 })
  }
}
