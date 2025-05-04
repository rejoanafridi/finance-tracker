"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useSocket } from "./use-socket"

interface DashboardData {
  totalIncome: number
  totalExpenses: number
  balance: number
  recentTransactions: any[]
  monthlyData: {
    month: string
    income: number
    expense: number
  }[]
  categorySummary: Record<string, number>
}

async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch("/api/dashboard")

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch dashboard data")
  }

  return response.json()
}

export function useDashboard() {
  const { socket, isConnected } = useSocket()
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60, // 1 minute
  })

  // Listen for real-time updates that should refresh dashboard data
  useEffect(() => {
    if (!socket || !isConnected) return

    const handleDataChange = () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    }

    socket.on("transaction:created", handleDataChange)
    socket.on("transaction:updated", handleDataChange)
    socket.on("transaction:deleted", handleDataChange)
    socket.on("budget:updated", handleDataChange)

    return () => {
      socket.off("transaction:created", handleDataChange)
      socket.off("transaction:updated", handleDataChange)
      socket.off("transaction:deleted", handleDataChange)
      socket.off("budget:updated", handleDataChange)
    }
  }, [socket, isConnected, queryClient])

  return {
    dashboardData: data,
    isLoading,
    error,
    refetch,
  }
}
