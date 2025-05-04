import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Budgets | Personal Finance Tracker",
  description: "Set and track your spending limits across different categories",
}

export default function BudgetsLayout({ children }: { children: React.ReactNode }) {
  return children
}
