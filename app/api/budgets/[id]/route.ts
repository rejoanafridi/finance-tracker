import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Budget } from "@/models/budget"
import { auth } from "@/lib/auth"
import { z } from "zod"

const budgetUpdateSchema = z.object({
  category: z.string().min(1, "Category is required").optional(),
  amount: z.number().positive("Amount must be positive").optional(),
  period: z.enum(["monthly", "quarterly", "yearly"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

// Get a specific budget
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const user = await auth()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const budget = await Budget.findOne({
      _id: params.id,
      userId: user.id,
    })

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    return NextResponse.json(budget)
  } catch (error) {
    console.error("Error fetching budget:", error)
    return NextResponse.json({ error: "Failed to fetch budget" }, { status: 500 })
  }
}

// Update a budget
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const user = await auth()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    // Validate input
    const result = budgetUpdateSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    // Process dates if provided
    if (data.startDate) {
      data.startDate = new Date(data.startDate)
    }

    if (data.endDate) {
      data.endDate = new Date(data.endDate)
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: params.id, userId: user.id },
      { ...data, updatedAt: new Date() },
      { new: true },
    )

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    return NextResponse.json(budget)
  } catch (error) {
    console.error("Error updating budget:", error)
    return NextResponse.json({ error: "Failed to update budget" }, { status: 500 })
  }
}

// Delete a budget
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const user = await auth()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const budget = await Budget.findOneAndDelete({
      _id: params.id,
      userId: user.id,
    })

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Budget deleted successfully" })
  } catch (error) {
    console.error("Error deleting budget:", error)
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 })
  }
}
