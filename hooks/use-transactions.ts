"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSocket } from "./use-socket"
import { useEffect } from "react"
import type { Transaction } from "@/types"

// API functions
async function fetchTransactions(filters?: Record<string, string>) {
  const queryParams = new URLSearchParams(filters)
  const response = await fetch(`/api/transactions?${queryParams}`)

  if (!response.ok) {
    throw new Error("Failed to fetch transactions")
  }

  return response.json()
}

async function createTransaction(transaction: Omit<Transaction, "id">) {
  const response = await fetch("/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
  })

  if (!response.ok) {
    throw new Error("Failed to create transaction")
  }

  return response.json()
}

async function updateTransaction(transaction: Transaction) {
  const response = await fetch(`/api/transactions/${transaction.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
  })

  if (!response.ok) {
    throw new Error("Failed to update transaction")
  }

  return response.json()
}

async function deleteTransaction(id: string) {
  const response = await fetch(`/api/transactions/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete transaction")
  }

  return response.json()
}

export function useTransactions(filters?: Record<string, string>) {
  const queryClient = useQueryClient()
  const { socket, isConnected } = useSocket()

  // Query for fetching transactions
  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => fetchTransactions(filters),
  })

  // Mutation for creating a transaction
  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: (newTransaction) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })

      // Emit socket event
      if (socket && isConnected) {
        socket.emit("transaction:create", newTransaction)
      }
    },
  })

  // Mutation for updating a transaction
  const updateMutation = useMutation({
    mutationFn: updateTransaction,
    onSuccess: (updatedTransaction) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })

      // Emit socket event
      if (socket && isConnected) {
        socket.emit("transaction:update", updatedTransaction)
      }
    },
  })

  // Mutation for deleting a transaction
  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })

      // Emit socket event
      if (socket && isConnected) {
        socket.emit("transaction:delete", { id })
      }
    },
  })

  // Listen for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return

    const handleTransactionCreated = (transaction: Transaction) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    }

    const handleTransactionUpdated = (transaction: Transaction) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    }

    const handleTransactionDeleted = ({ id }: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    }

    socket.on("transaction:created", handleTransactionCreated)
    socket.on("transaction:updated", handleTransactionUpdated)
    socket.on("transaction:deleted", handleTransactionDeleted)

    return () => {
      socket.off("transaction:created", handleTransactionCreated)
      socket.off("transaction:updated", handleTransactionUpdated)
      socket.off("transaction:deleted", handleTransactionDeleted)
    }
  }, [socket, isConnected, queryClient])

  // Calculate totals
  const totalIncome = transactions
    .filter((t: Transaction) => t.type === "income")
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t: Transaction) => t.type === "expense")
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  return {
    transactions,
    isLoading,
    error,
    createTransaction: createMutation.mutate,
    updateTransaction: updateMutation.mutate,
    deleteTransaction: deleteMutation.mutate,
    totalIncome,
    totalExpenses,
    balance,
  }
}
