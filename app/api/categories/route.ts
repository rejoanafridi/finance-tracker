import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Category } from "@/models/category"
import { auth } from "@/lib/auth"

// Get all categories for the authenticated user
export async function GET(req: Request) {
  try {
    await connectToDatabase()
    const user = await auth()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const categories = await Category.find({ userId: user.id }).sort({ name: 1 })
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

// Create a new category
export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const user = await auth()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name } = await req.json()

    // Check if category already exists
    const existingCategory = await Category.findOne({
      name: name,
      userId: user.id,
    })

    if (existingCategory) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 })
    }

    const category = new Category({
      name,
      userId: user.id,
    })

    await category.save()
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
