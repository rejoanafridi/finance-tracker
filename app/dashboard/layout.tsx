import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Personal Finance Tracker",
  description: "View your financial overview, recent transactions, and spending patterns",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
