'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// API functions
async function fetchCategories() {
    const response = await fetch('/api/categories')

    if (!response.ok) {
        throw new Error('Failed to fetch categories')
    }

    return response.json()
}

async function createCategory(name: string) {
    const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
    })

    if (!response.ok) {
        throw new Error('Failed to create category')
    }

    return response.json()
}

async function updateCategory(id: string, name: string) {
    const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
    })

    if (!response.ok) {
        throw new Error('Failed to update category')
    }

    return response.json()
}

async function deleteCategory(id: string) {
    const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
    })

    if (!response.ok) {
        throw new Error('Failed to delete category')
    }

    return response.json()
}

async function importCategories(
    categories: Array<{ id: string; name: string }>
) {
    const response = await fetch('/api/categories/import', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ categories })
    })

    if (!response.ok) {
        throw new Error('Failed to import categories')
    }

    return response.json()
}

async function exportCategories() {
    const response = await fetch('/api/categories/export')

    if (!response.ok) {
        throw new Error('Failed to export categories')
    }

    return response.json()
}

async function clearAllCategories() {
    const response = await fetch('/api/categories/clear', {
        method: 'DELETE'
    })

    if (!response.ok) {
        throw new Error('Failed to clear all categories')
    }

    return response.json()
}

export function useCategories() {
    const queryClient = useQueryClient()

    // Query for fetching categories
    const {
        data: categories = [],
        isLoading,
        error
    } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories
    })

    // Mutation for creating a category
    const createMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        }
    })

    // Mutation for updating a category
    const updateMutation = useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) =>
            updateCategory(id, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        }
    })

    // Mutation for deleting a category
    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        }
    })

    // Mutation for importing categories
    const importMutation = useMutation({
        mutationFn: importCategories,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        }
    })

    // Mutation for clearing all categories
    const clearAllMutation = useMutation({
        mutationFn: clearAllCategories,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        }
    })

    return {
        categories,
        isLoading,
        error,
        createCategory: createMutation.mutate,
        updateCategory: updateMutation.mutate,
        deleteCategory: deleteMutation.mutate,
        importCategories: importMutation.mutate,
        exportCategories,
        clearAllCategories: clearAllMutation.mutate
    }
}
