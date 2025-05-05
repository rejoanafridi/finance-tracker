'use client'

import { useDashboard } from '@/hooks/use-dashboard'
import { formatCurrency } from '@/lib/utils'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState, useEffect } from 'react'
import { useFinance } from '@/context/finance-context'
import { Skeleton } from '@/components/ui/skeleton'
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Sector,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts'

// Predefined colors for consistent category coloring
const PIE_CHART_COLORS = [
    '#8884d8',
    '#83a6ed',
    '#8dd1e1',
    '#82ca9d',
    '#a4de6c',
    '#d0ed57',
    '#ffc658',
    '#ff8042',
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042'
]

export function MonthlyChart() {
    const { dashboardData, isLoading } = useDashboard()
    const { currency } = useFinance()
    const [activeIndex, setActiveIndex] = useState(0)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted || isLoading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Financial Overview</CardTitle>
                    <CardDescription>Loading...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <Skeleton className="h-full w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    const monthlyData = dashboardData?.monthlyData || []
    const categorySummary = dashboardData?.categorySummary || {}

    const barChartData = monthlyData
    const pieChartData = Object.entries(categorySummary).map(
        ([name, amount], index) => ({
            name,
            value: amount,
            fill: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]
        })
    )

    // Custom formatter for currency in tooltips
    const currencyFormatter = (value) => formatCurrency(value, currency)

    // Custom Pie Chart Active Sector
    const renderActiveShape = (props) => {
        const RADIAN = Math.PI / 180
        const {
            cx,
            cy,
            midAngle,
            innerRadius,
            outerRadius,
            startAngle,
            endAngle,
            fill,
            payload,
            percent,
            value
        } = props

        const sin = Math.sin(-RADIAN * midAngle)
        const cos = Math.cos(-RADIAN * midAngle)
        const sx = cx + (outerRadius + 10) * cos
        const sy = cy + (outerRadius + 10) * sin
        const mx = cx + (outerRadius + 30) * cos
        const my = cy + (outerRadius + 30) * sin
        const ex = mx + (cos >= 0 ? 1 : -1) * 22
        const ey = my
        const textAnchor = cos >= 0 ? 'start' : 'end'

        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 6}
                    outerRadius={outerRadius + 10}
                    fill={fill}
                />
                <path
                    d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
                    stroke={fill}
                    fill="none"
                />
                <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                <text
                    x={ex + (cos >= 0 ? 1 : -1) * 12}
                    y={ey}
                    textAnchor={textAnchor}
                    fill="#333"
                >
                    {payload.name}
                </text>
                <text
                    x={ex + (cos >= 0 ? 1 : -1) * 12}
                    y={ey}
                    dy={18}
                    textAnchor={textAnchor}
                    fill="#999"
                >
                    {`${formatCurrency(value, currency)} (${(
                        percent * 100
                    ).toFixed(2)}%)`}
                </text>
            </g>
        )
    }

    // Custom tooltip for bar chart
    const CustomBarTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="recharts-custom-tooltip rounded-lg border bg-background p-4 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded bg-primary" />
                            <span className="text-sm">Income:</span>
                        </div>
                        <span className="text-sm font-medium">
                            {formatCurrency(payload[0].value, currency)}
                        </span>
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded bg-muted-foreground" />
                            <span className="text-sm">Expense:</span>
                        </div>
                        <span className="text-sm font-medium">
                            {formatCurrency(payload[1].value, currency)}
                        </span>
                    </div>
                </div>
            )
        }
        return null
    }

    const onPieEnter = (_, index) => {
        setActiveIndex(index)
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>
                    Your income and expenses over time
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="bar">
                    <TabsList className="mb-4">
                        <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                        <TabsTrigger value="pie">Pie Chart</TabsTrigger>
                    </TabsList>

                    <TabsContent value="bar" className="h-[300px]">
                        {barChartData.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                No data available for the selected period
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={barChartData}
                                    margin={{
                                        top: 20,
                                        right: 20,
                                        left: 60,
                                        bottom: 20
                                    }}
                                >
                                    <XAxis
                                        dataKey="month"
                                        tick={{
                                            fill: 'var(--muted-foreground)'
                                        }}
                                    />
                                    <YAxis
                                        tickFormatter={currencyFormatter}
                                        tick={{
                                            fill: 'var(--muted-foreground)'
                                        }}
                                    />
                                    <Tooltip content={<CustomBarTooltip />} />
                                    <Legend />
                                    <Bar
                                        dataKey="income"
                                        fill="var(--primary)"
                                        radius={[4, 4, 0, 0]}
                                        name="Income"
                                    />
                                    <Bar
                                        dataKey="expense"
                                        fill="var(--muted-foreground)"
                                        radius={[4, 4, 0, 0]}
                                        name="Expense"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </TabsContent>

                    <TabsContent value="pie" className="h-[300px]">
                        {pieChartData.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                No category data available
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        activeIndex={activeIndex}
                                        activeShape={renderActiveShape}
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                        onMouseEnter={onPieEnter}
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    PIE_CHART_COLORS[
                                                        index %
                                                            PIE_CHART_COLORS.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
