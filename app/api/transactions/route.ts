import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Transaction } from "@/models/transaction"
import { auth } from "@/lib/auth"

// Get all transactions for the authenticated user
export async function GET(req: Request) {
  try {
    await connectToDatabase()
    const user = await auth()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const search = searchParams.get("search")

    // Build query
    const query: any = { userId: user.id }

    if (category) query.category = category
    if (type) query.type = type
    if (search) {
      query.$or = [{ description: { $regex: search, $options: "i" } }, { category: { $regex: search, $options: "i" } }]
    }
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const transactions = await Transaction.find(query).sort({ date: -1 })
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

// Create a new transaction
export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const user = await auth()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const transaction = new Transaction({
      ...data,
      userId: user.id,
    })

    await transaction.save()
    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
