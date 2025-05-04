import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile | Personal Finance Tracker",
  description: "Manage your account information and preferences",
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
