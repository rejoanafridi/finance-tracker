import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

let exchangeRates: Record<string, number> = {
    USD: 1,
    EUR: 0.8841601029,
    CAD: 1.3811801869,
    BDT: 121.9879131986
}

export async function fetchExchangeRates(apiKey: string) {
    try {
        const response = await fetch(
            `https://api.currencyapi.com/v3/latest?apikey=${apiKey}&currencies=EUR%2CUSD%2CCAD%2CBDT`,
            {
                cache: 'force-cache',
                next: { revalidate: 86400 }
            }
        )

        const data = await response.json()
        if (data.data) {
            exchangeRates = {
                USD: 1,
                EUR: data.data.EUR.value,
                CAD: data.data.CAD.value,
                BDT: data.data.BDT.value
            }
        }
        return data
    } catch (error) {
        console.error('Error fetching exchange rates:', error)
    }
}

export function formatCurrency(
    amount: number,
    currency: string = 'USD',
    baseCurrency: string = 'USD'
): string {
    const convertedAmount =
        amount * (exchangeRates[currency] / exchangeRates[baseCurrency])
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2
    }).format(convertedAmount)
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date)
}
