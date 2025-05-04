import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/models/user"
import { auth } from "@/lib/auth"
import { z } from "zod"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
})

// Get user profile
export async function GET(req: Request) {
  try {
    await connectToDatabase()
    const user = await auth()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userProfile = await User.findById(user.id).select("-password")

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: userProfile._id,
      name: userProfile.name,
      email: userProfile.email,
      image: userProfile.image || null,
      createdAt: userProfile.createdAt,
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

// Update user profile
export async function PUT(req: Request) {
  try {
    await connectToDatabase()
    const user = await auth()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    // Validate input
    const result = profileSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    // Check if email is already taken by another user
    if (data.email !== user.email) {
      const existingUser = await User.findOne({ email: data.email, _id: { $ne: user.id } })
      if (existingUser) {
        return NextResponse.json({ error: "Email is already in use" }, { status: 400 })
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { name: data.name, email: data.email },
      { new: true },
    ).select("-password")

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image || null,
      createdAt: updatedUser.createdAt,
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}
