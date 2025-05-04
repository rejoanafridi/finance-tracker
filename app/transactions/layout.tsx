import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Transactions | Personal Finance Tracker",
  description: "Manage your income and expenses with detailed transaction tracking",
}

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
