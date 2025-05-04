"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Receipt, Settings, Wallet, PieChart, User } from "lucide-react"
import { motion } from "framer-motion"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/transactions",
      label: "Transactions",
      icon: Receipt,
      active: pathname === "/transactions",
    },
    {
      href: "/budgets",
      label: "Budgets",
      icon: PieChart,
      active: pathname === "/budgets",
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
      active: pathname === "/profile",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ]

  return (
    <div className="mr-4 hidden md:flex justify-center">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Wallet className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">Finance Tracker</span>
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "relative flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              route.active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <route.icon className="h-4 w-4" />
            {route.label}
            {route.active && (
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary"
                layoutId="navbar-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </Link>
        ))}
      </nav>
    </div>
  )
}
