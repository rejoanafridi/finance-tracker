"use client"

import React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Transaction } from "@/types"

type FilterOptions = {
  searchTerm?: string
  category?: string
  type?: "income" | "expense" | ""
  date?: Date
}

interface FinanceContextType {
  transactions: Transaction[]
  filteredTransactions: Transaction[]
  categories: string[]
  totalIncome: number
  totalExpenses: number
  balance: number
  categorySummary: Record<string, number>
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (transaction: Transaction) => void
  deleteTransaction: (id: string) => void
  addCategory: (category: string) => void
  removeCategory: (category: string) => void
  applyFilters: (filters: FilterOptions) => void
  clearFilters: () => void
  exportData: () => void
  importData: (data: any) => void
  clearAllData: () => void
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

const defaultCategories = [
  "Salary",
  "Freelance",
  "Investments",
  "Rent",
  "Groceries",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Healthcare",
  "Education",
  "Shopping",
  "Dining",
]

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<string[]>(defaultCategories)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load data from localStorage on initial render (only on client)
  useEffect(() => {
    if (isClient) {
      const storedTransactions = localStorage.getItem("finance_transactions")
      const storedCategories = localStorage.getItem("finance_categories")

      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions))
      }

      if (storedCategories) {
        setCategories(JSON.parse(storedCategories))
      }
    }
  }, [isClient])

  // Save data to localStorage whenever it changes (only on client)
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("finance_transactions", JSON.stringify(transactions))
    }
  }, [transactions, isClient])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("finance_categories", JSON.stringify(categories))
    }
  }, [categories, isClient])

  // Calculate totals
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  // Calculate category summary for expenses
  const categorySummary = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>,
    )

  // Apply filters
  const applyFilters = React.useCallback(
    (options: FilterOptions) => {
      setFilters(options)

      let filtered = [...transactions]

      if (options.searchTerm) {
        const term = options.searchTerm.toLowerCase()
        filtered = filtered.filter(
          (t) => t.description.toLowerCase().includes(term) || t.category.toLowerCase().includes(term),
        )
      }

      if (options.category) {
        filtered = filtered.filter((t) => t.category === options.category)
      }

      if (options.type) {
        filtered = filtered.filter((t) => t.type === options.type)
      }

      if (options.date) {
        const filterDate = new Date(options.date)
        filtered = filtered.filter((t) => {
          const transactionDate = new Date(t.date)
          return (
            transactionDate.getFullYear() === filterDate.getFullYear() &&
            transactionDate.getMonth() === filterDate.getMonth() &&
            transactionDate.getDate() === filterDate.getDate()
          )
        })
      }

      setFilteredTransactions(filtered)
    },
    [transactions],
  )

  const clearFilters = () => {
    setFilters({})
    setFilteredTransactions([])
  }

  // CRUD operations
  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [...prev, transaction])
  }

  const updateTransaction = (transaction: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === transaction.id ? transaction : t)))
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories((prev) => [...prev, category])
    }
  }

  const removeCategory = (category: string) => {
    setCategories((prev) => prev.filter((c) => c !== category))
  }

  // Data management
  const exportData = () => {
    if (!isClient) return

    const data = {
      transactions,
      categories,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `finance-tracker-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importData = (data: any) => {
    if (data.transactions && Array.isArray(data.transactions)) {
      setTransactions(data.transactions)
    }

    if (data.categories && Array.isArray(data.categories)) {
      setCategories(data.categories)
    }
  }

  const clearAllData = () => {
    setTransactions([])
    setCategories(defaultCategories)
    setFilteredTransactions([])
    setFilters({})
  }

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        filteredTransactions,
        categories,
        totalIncome,
        totalExpenses,
        balance,
        categorySummary,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        removeCategory,
        applyFilters,
        clearFilters,
        exportData,
        importData,
        clearAllData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}
