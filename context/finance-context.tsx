'use client'

import type React from 'react'
import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback
} from 'react'
import type { Transaction } from '@/types'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

type FilterOptions = {
    searchTerm?: string
    category?: string
    type?: 'income' | 'expense' | ''
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
    currency: string
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>
    updateTransaction: (transaction: Transaction) => Promise<void>
    deleteTransaction: (id: string) => Promise<void>
    addCategory: (category: string) => Promise<void>
    removeCategory: (category: string) => Promise<void>
    applyFilters: (filters: FilterOptions) => void
    clearFilters: () => void
    exportData: () => void
    importData: (data: any) => void
    clearAllData: () => void
    setCurrency: (currency: string) => void
    isLoading: boolean
    error: string | null
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

const defaultCategories = [
    'Salary',
    'Freelance',
    'Investments',
    'Rent',
    'Groceries',
    'Utilities',
    'Transportation',
    'Entertainment',
    'Healthcare',
    'Education',
    'Shopping',
    'Dining'
]

export function FinanceProvider({ children }: { children: React.ReactNode }) {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [filteredTransactions, setFilteredTransactions] = useState<
        Transaction[]
    >([])

    const queryClient = useQueryClient()

    const [categories, setCategories] = useState<string[]>(defaultCategories)
    const [filters, setFilters] = useState<FilterOptions>({})
    const [isClient, setIsClient] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currency, setCurrency] = useState('USD')

    // Set isClient to true when component mounts
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Fetch transactions from API
    const fetchTransactions = useCallback(async () => {
        if (!isClient) return

        try {
            setIsLoading(true)
            setError(null)

            // Try to fetch from API first
            try {
                const response = await fetch('/api/transactions')

                if (response.ok) {
                    const data = await response.json()
                    setTransactions(data)
                    return
                }
            } catch (err) {
                console.error(
                    'API fetch failed, falling back to localStorage',
                    err
                )
            }

            // Fallback to localStorage if API fails
            const storedTransactions = localStorage.getItem(
                'finance_transactions'
            )
            if (storedTransactions) {
                setTransactions(JSON.parse(storedTransactions))
            }
        } catch (err) {
            setError('Failed to load transactions')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }, [isClient])

    // Fetch categories from API
    const fetchCategories = useCallback(async () => {
        if (!isClient) return

        try {
            // Try to fetch from API first
            try {
                const response = await fetch('/api/categories')

                if (response.ok) {
                    const data = await response.json()
                    setCategories(data.map((cat: any) => cat.name))
                    return
                }
            } catch (err) {
                console.error(
                    'API fetch failed, falling back to localStorage',
                    err
                )
            }

            // Fallback to localStorage if API fails
            const storedCategories = localStorage.getItem('finance_categories')
            if (storedCategories) {
                setCategories(JSON.parse(storedCategories))
            }
        } catch (err) {
            console.error(err)
        }
    }, [isClient])

    // Load data on initial render
    useEffect(() => {
        if (isClient) {
            fetchTransactions()
            fetchCategories()
            const storedCurrency = localStorage.getItem('finance_currency')
            if (storedCurrency) {
                setCurrency(storedCurrency)
            }
        }
    }, [isClient, fetchTransactions, fetchCategories])

    // Save data to localStorage whenever it changes (as backup)
    useEffect(() => {
        if (isClient && transactions.length > 0) {
            localStorage.setItem(
                'finance_transactions',
                JSON.stringify(transactions)
            )
        }
    }, [transactions, isClient])

    useEffect(() => {
        if (isClient && categories.length > 0) {
            localStorage.setItem(
                'finance_categories',
                JSON.stringify(categories)
            )
        }
    }, [categories, isClient])

    // Calculate totals
    const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpenses

    // Calculate category summary for expenses
    const categorySummary = transactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount
            return acc
        }, {} as Record<string, number>)

    // Apply filters
    const applyFilters = useCallback(
        (options: FilterOptions) => {
            setFilters(options)

            let filtered = [...transactions]

            if (options.searchTerm) {
                const term = options.searchTerm.toLowerCase()
                filtered = filtered.filter(
                    (t) =>
                        t.description.toLowerCase().includes(term) ||
                        t.category.toLowerCase().includes(term)
                )
            }

            if (options.category) {
                filtered = filtered.filter(
                    (t) => t.category === options.category
                )
            }

            if (options.type) {
                filtered = filtered.filter((t) => t.type === options.type)
            }

            if (options.date) {
                const filterDate = new Date(options.date)
                filtered = filtered.filter((t) => {
                    const transactionDate = new Date(t.date)
                    return (
                        transactionDate.getFullYear() ===
                            filterDate.getFullYear() &&
                        transactionDate.getMonth() === filterDate.getMonth() &&
                        transactionDate.getDate() === filterDate.getDate()
                    )
                })
            }

            setFilteredTransactions(filtered)
        },
        [transactions]
    )

    const clearFilters = () => {
        setFilters({})
        setFilteredTransactions([])
    }

    // CRUD operations with API integration
    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        try {
            setIsLoading(true)
            setError(null)

            // Try API first
            try {
                const response = await fetch('/api/transactions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(transaction)
                })

                if (response.ok) {
                    const newTransaction = await response.json()
                    setTransactions((prev) => [...prev, newTransaction])
                    toast.success('Transaction added successfully')
                    return
                } else {
                    throw new Error('Failed to add transaction')
                }
            } catch (err) {
                console.error('API call failed, using local state', err)
                // Fallback to local state
                const newTransaction = {
                    ...transaction,
                    id: Date.now().toString()
                }
                setTransactions((prev) => [...prev, newTransaction])
                toast.success('Transaction added (offline mode)')
            }
        } catch (err) {
            setError('Failed to add transaction')
            toast.error('Failed to add transaction')
            console.error(err)
        } finally {
            setIsLoading(false)
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        }
    }

    const updateTransaction = async (transaction: Transaction) => {
        try {
            setIsLoading(true)
            setError(null)

            // Try API first
            try {
                const response = await fetch(
                    `/api/transactions/${transaction.id}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(transaction)
                    }
                )

                if (response.ok) {
                    setTransactions((prev) =>
                        prev.map((t) =>
                            t.id === transaction.id ? transaction : t
                        )
                    )
                    toast.success('Transaction updated successfully')
                    return
                } else {
                    throw new Error('Failed to update transaction')
                }
            } catch (err) {
                console.error('API call failed, using local state', err)
                // Fallback to local state
                setTransactions((prev) =>
                    prev.map((t) => (t.id === transaction.id ? transaction : t))
                )
                toast.success('Transaction updated (offline mode)')
            }
        } catch (err) {
            setError('Failed to update transaction')
            toast.error('Failed to update transaction')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const deleteTransaction = async (id: string) => {
        try {
            setIsLoading(true)
            setError(null)

            // Try API first
            try {
                const response = await fetch(`/api/transactions/${id}`, {
                    method: 'DELETE'
                })

                if (response.ok) {
                    setTransactions((prev) => prev.filter((t) => t.id !== id))
                    toast.success('Transaction deleted successfully')
                    return
                } else {
                    throw new Error('Failed to delete transaction')
                }
            } catch (err) {
                console.error('API call failed, using local state', err)
                // Fallback to local state
                setTransactions((prev) => prev.filter((t) => t.id !== id))
                toast.success('Transaction deleted (offline mode)')
            }
        } catch (err) {
            setError('Failed to delete transaction')
            toast.error('Failed to delete transaction')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const addCategory = async (category: string) => {
        if (categories.includes(category)) return

        try {
            setIsLoading(true)
            setError(null)

            // Try API first
            try {
                const response = await fetch('/api/categories', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: category })
                })

                if (response.ok) {
                    setCategories((prev) => [...prev, category])
                    toast.success('Category added successfully')
                    return
                } else {
                    throw new Error('Failed to add category')
                }
            } catch (err) {
                console.error('API call failed, using local state', err)
                // Fallback to local state
                setCategories((prev) => [...prev, category])
                toast.success('Category added (offline mode)')
            }
        } catch (err) {
            setError('Failed to add category')
            toast.error('Failed to add category')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const removeCategory = async (category: string) => {
        try {
            setIsLoading(true)
            setError(null)

            // Find category ID first (if using API)
            let categoryId = category // Default to using the name as ID for local fallback

            try {
                const response = await fetch('/api/categories')
                if (response.ok) {
                    const allCategories = await response.json()
                    const categoryObj = allCategories.find(
                        (c: any) => c.name === category
                    )
                    if (categoryObj) {
                        categoryId = categoryObj._id || categoryObj.id
                    }
                }
            } catch (err) {
                console.error('Failed to fetch category ID', err)
            }

            // Try API first
            try {
                const response = await fetch(`/api/categories/${categoryId}`, {
                    method: 'DELETE'
                })

                if (response.ok) {
                    setCategories((prev) => prev.filter((c) => c !== category))
                    toast.success('Category removed successfully')
                    return
                } else {
                    throw new Error('Failed to remove category')
                }
            } catch (err) {
                console.error('API call failed, using local state', err)
                // Fallback to local state
                setCategories((prev) => prev.filter((c) => c !== category))
                toast.success('Category removed (offline mode)')
            }
        } catch (err) {
            setError('Failed to remove category')
            toast.error('Failed to remove category')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    // Data management
    const exportData = () => {
        if (!isClient) return

        const data = {
            transactions,
            categories
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        })

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `finance-tracker-export-${
            new Date().toISOString().split('T')[0]
        }.json`
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

    const clearAllData = async () => {
        try {
            setIsLoading(true)
            setError(null)

            // Try to clear data from API
            let apiClearFailed = false

            try {
                // This would be a custom endpoint to clear all data
                const response = await fetch('/api/clear-all-data', {
                    method: 'DELETE'
                })

                if (!response.ok) {
                    apiClearFailed = true
                }
            } catch (err) {
                console.error('API clear failed', err)
                apiClearFailed = true
            }

            // Clear local state
            setTransactions([])
            setCategories(defaultCategories)
            setFilteredTransactions([])
            setFilters({})

            // Clear localStorage
            localStorage.removeItem('finance_transactions')
            localStorage.removeItem('finance_categories')

            toast.success(
                apiClearFailed
                    ? 'Data cleared locally'
                    : 'All data cleared successfully'
            )
        } catch (err) {
            setError('Failed to clear data')
            toast.error('Failed to clear data')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
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
                currency,
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
                setCurrency: (newCurrency: string) => {
                    setCurrency(newCurrency)
                    if (isClient) {
                        localStorage.setItem('finance_currency', newCurrency)
                    }
                },
                isLoading,
                error
            }}
        >
            {children}
        </FinanceContext.Provider>
    )
}

export function useFinance() {
    const context = useContext(FinanceContext)
    if (context === undefined) {
        throw new Error('useFinance must be used within a FinanceProvider')
    }
    return context
}
