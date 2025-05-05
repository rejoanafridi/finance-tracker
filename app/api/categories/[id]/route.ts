import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Category } from "@/models/category"
import { Transaction } from "@/models/transaction"
import { auth } from "@/lib/auth"

// Delete a category
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase()
    const user = await auth()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if category is in use
    const categoryInUse = await Transaction.findOne({
      categoryId: params.id,
      userId: user.id,
    })

    if (categoryInUse) {
      return NextResponse.json({ error: "Cannot delete category that is in use by transactions" }, { status: 400 })
    }

    const category = await Category.findOneAndDelete({
      _id: params.id,
      userId: user.id,
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}

// Update a category
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase()
    const user = await auth()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name } = await req.json()

    // Check if category with new name already exists
    const existingCategory = await Category.findOne({
      name: name,
      userId: user.id,
      _id: { $ne: params.id },
    })

    if (existingCategory) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 })
    }

    const category = await Category.findOneAndUpdate({ _id: params.id, userId: user.id }, { name }, { new: true })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}
