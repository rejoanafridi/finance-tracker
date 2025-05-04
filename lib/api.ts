import { useLoading } from "@/context/loading-context"

// Create a custom fetch function that shows/hides the global loading indicator
export function useApiClient() {
  const { startLoading, stopLoading } = useLoading()

  const apiClient = async (url: string, options?: RequestInit) => {
    try {
      startLoading()
      const response = await fetch(url, options)

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `API request failed with status ${response.status}`)
      }

      return await response.json()
    } finally {
      stopLoading()
    }
  }

  return apiClient
}
