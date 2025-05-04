import { createContext, useContext, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchExchangeRates } from '@/lib/utils'

type FinanceContextType = {
    currency: string
    setCurrency: (currency: string) => void
    exchangeRates: any
}

const FinanceContext = createContext<FinanceContextType>({
    currency: 'USD',
    setCurrency: () => {},
    exchangeRates: {
        USD: 1,
        EUR: 0.8841601029,
        CAD: 1.3811801869,
        BDT: 121.9879131986
    }
})

export function FinanceProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrency] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('finance_currency') || 'USD'
        }
        return 'USD'
    })

    const apiKey = 'cur_live_r4VcvXkTyIYm5H59iFWvn2KIceoiNVqwftX9G8zo'

    const { data: exchangeRates } = useQuery<Record<string, number>>({
        queryKey: ['exchangeRates'],
        queryFn: () => fetchExchangeRates(apiKey),
        staleTime: 24 * 60 * 60 * 1000,
        cacheTime: 25 * 60 * 60 * 1000,
        initialData: {
            USD: 1,
            EUR: 0.8841601029,
            CAD: 1.3811801869,
            BDT: 121.9879131986
        }
    })
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('finance_currency', currency)
        }
    }, [currency])

    return (
        <FinanceContext.Provider
            value={{
                currency,
                setCurrency,
                exchangeRates
            }}
        >
            {children}
        </FinanceContext.Provider>
    )
}

export function useFinance() {
    return useContext(FinanceContext)
}
