'use client'

import { useDashboard } from '@/hooks/use-dashboard'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDownIcon, ArrowUpIcon, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useFinance } from '@/context/finance-context'

export function OverviewCards() {
    const { dashboardData, isLoading } = useDashboard()
    const { currency } = useFinance()
    const totalIncome = dashboardData?.totalIncome || 0
    const totalExpenses = dashboardData?.totalExpenses || 0
    const balance = dashboardData?.balance || 0
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])
    console.log(formatCurrency(totalIncome, currency))

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    }

    if (!isMounted || isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Loading...
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$0.00</div>
                            <p className="text-xs text-muted-foreground">
                                Loading...
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            animate="show"
        >
            <motion.div variants={item}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Income
                        </CardTitle>
                        <ArrowUpIcon className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(totalIncome, currency)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Money coming in
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={item}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Expenses
                        </CardTitle>
                        <ArrowDownIcon className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(totalExpenses, currency)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Money going out
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={item} className="sm:col-span-2 lg:col-span-1">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Current Balance
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(balance, currency)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Available funds
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}
