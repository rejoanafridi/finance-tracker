import { connectToDatabase } from "@/lib/db"
import { User } from "@/models/user"
import { NextResponse } from "next/server"
import crypto from "crypto"
import { sendEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    await connectToDatabase()
    
    const user = await User.findOne({ email })
    
    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email" },
        { status: 404 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour from now

    // Update user with reset token
    user.resetToken = resetToken
    user.resetTokenExpiry = resetTokenExpiry
    await user.save()

    // Send email with reset link
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
    
    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset for your account.</p>
        <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
        <p>This link will expire in 1 hour.</p>
      `
    })

    return NextResponse.json(
      { message: "Password reset email sent" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    )
  }
}