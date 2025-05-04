import { connectToDatabase } from "@/lib/db"
import { User } from "@/models/user"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()
    
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      )
    }

    await connectToDatabase()
    
    const user = await User.findOne({ 
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Update user password and clear reset token
    user.password = hashedPassword
    user.resetToken = undefined
    user.resetTokenExpiry = undefined
    await user.save()

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "An error occurred while resetting your password" },
      { status: 500 }
    )
  }
}