"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface Budget {
  id: string
  category: string
  amount: number
  period: "monthly" | "quarterly" | "yearly"
  startDate?: string
  endDate?: string
}

export interface BudgetSummary {
  id: string
  category: string
  budgeted: number
  spent: number
  remaining: number
  percentage: number
  status: "good" | "warning" | "exceeded"
}

export interface BudgetSummaryResponse {
  period: string
  startDate: string
  endDate: string
  budgets: BudgetSummary[]
  totals: {
    budgeted: number
    spent: number
    remaining: number
    percentage: number
    status: "good" | "warning" | "exceeded"
  }
}

// API functions
async function fetchBudgets(period = "monthly") {
  const response = await fetch(`/api/budgets?period=${period}`)
  if (!response.ok) {
    throw new Error("Failed to fetch budgets")
  }
  return response.json()
}

async function fetchBudgetSummary(period = "monthly") {
  const response = await fetch(`/api/budgets/summary?period=${period}`)
  if (!response.ok) {
    throw new Error("Failed to fetch budget summary")
  }
  return response.json()
}

async function createBudget(budget: Omit<Budget, "id">) {
  const response = await fetch("/api/budgets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(budget),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create budget")
  }

  return response.json()
}

async function updateBudget(budget: Budget) {
  const response = await fetch(`/api/budgets/${budget.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(budget),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update budget")
  }

  return response.json()
}

async function deleteBudget(id: string) {
  const response = await fetch(`/api/budgets/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to delete budget")
  }

  return response.json()
}

export function useBudgets(period = "monthly") {
  const queryClient = useQueryClient()

  // Query for fetching budgets
  const {
    data: budgets = [],
    isLoading: isLoadingBudgets,
    error: budgetsError,
  } = useQuery({
    queryKey: ["budgets", period],
    queryFn: () => fetchBudgets(period),
  })

  // Query for fetching budget summary
  const {
    data: budgetSummary,
    isLoading: isLoadingSummary,
    error: summaryError,
  } = useQuery({
    queryKey: ["budgetSummary", period],
    queryFn: () => fetchBudgetSummary(period),
  })

  // Mutation for creating a budget
  const createMutation = useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      queryClient.invalidateQueries({ queryKey: ["budgetSummary"] })
    },
  })

  // Mutation for updating a budget
  const updateMutation = useMutation({
    mutationFn: updateBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      queryClient.invalidateQueries({ queryKey: ["budgetSummary"] })
    },
  })

  // Mutation for deleting a budget
  const deleteMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      queryClient.invalidateQueries({ queryKey: ["budgetSummary"] })
    },
  })

  return {
    budgets,
    budgetSummary,
    isLoading: isLoadingBudgets || isLoadingSummary,
    error: budgetsError || summaryError,
    createBudget: createMutation.mutate,
    updateBudget: updateMutation.mutate,
    deleteBudget: deleteMutation.mutate,
  }
}
