'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { useEffect } from 'react'
import type { Transaction } from '@/types'
import { toast } from 'sonner'

// API functions
async function fetchTransactions(filters?: Record<string, string>) {
    const queryParams = new URLSearchParams(filters)
    const response = await fetch(`/api/transactions?${queryParams}`)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch transactions')
    }

    return response.json()
}

async function createTransaction(transaction: Omit<Transaction, 'id'>) {
    const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction)
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create transaction')
    }

    return response.json()
}

async function updateTransaction(transaction: Transaction) {
    const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction)
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update transaction')
    }

    return response.json()
}

async function deleteTransaction(id: string) {
    const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete transaction')
    }

    return response.json()
}

export function useTransactions(filters?: Record<string, string>) {
    const queryClient = useQueryClient()

    // Query for fetching transactions
    const {
        data: transactions = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['transactions', filters],
        queryFn: () => fetchTransactions(filters),
        retry: 2,
        staleTime: 1000 * 60 // 1 minute
    })

    // Mutation for creating a transaction
    const createMutation = useMutation({
        mutationFn: createTransaction,
        onSuccess: (newTransaction) => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            toast.success('Transaction created successfully')

            // // Emit socket event
            // if (socket && isConnected) {
            //   socket.emit("transaction:create", newTransaction)
            // }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create transaction')
        }
    })

    // Mutation for updating a transaction
    const updateMutation = useMutation({
        mutationFn: updateTransaction,
        onSuccess: (updatedTransaction) => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            toast.success('Transaction updated successfully')

            // // Emit socket event
            // if (socket && isConnected) {
            //   socket.emit("transaction:update", updatedTransaction)
            // }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update transaction')
        }
    })

    // Mutation for deleting a transaction
    const deleteMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            toast.success('Transaction deleted successfully')

            // // Emit socket event
            // if (socket && isConnected) {
            //   socket.emit("transaction:delete", { id })
            // }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete transaction')
        }
    })

    // Listen for real-time updates
    useEffect(() => {
        // if (!socket || !isConnected) return

        const handleTransactionCreated = (transaction: Transaction) => {
            toast.info('New transaction added')
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            // Also invalidate dashboard data
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        }

        const handleTransactionUpdated = (transaction: Transaction) => {
            toast.info('Transaction updated')
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        }

        const handleTransactionDeleted = ({ id }: { id: string }) => {
            toast.info('Transaction deleted')
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        }

        // socket.on("transaction:created", handleTransactionCreated)
        // socket.on("transaction:updated", handleTransactionUpdated)
        // socket.on("transaction:deleted", handleTransactionDeleted)

        // return () => {
        //   socket.off("transaction:created", handleTransactionCreated)
        //   socket.off("transaction:updated", handleTransactionUpdated)
        //   socket.off("transaction:deleted", handleTransactionDeleted)
        // }
    }, [queryClient])

    // Calculate totals
    const totalIncome = transactions
        .filter((t: Transaction) => t.type === 'income')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

    const totalExpenses = transactions
        .filter((t: Transaction) => t.type === 'expense')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

    const balance = totalIncome - totalExpenses

    return {
        transactions,
        isLoading,
        error,
        refetch,
        createTransaction: createMutation.mutate,
        updateTransaction: updateMutation.mutate,
        deleteTransaction: deleteMutation.mutate,
        totalIncome,
        totalExpenses,
        balance
    }
}
