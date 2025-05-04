import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings | Personal Finance Tracker",
  description: "Configure your application settings and preferences",
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
