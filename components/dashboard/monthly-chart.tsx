"use client"

import { useFinance } from "@/context/finance-context"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, Sector, XAxis, YAxis } from "recharts"
import { useState } from "react"

export function MonthlyChart() {
  const { transactions, categorySummary } = useFinance()
  const [activeIndex, setActiveIndex] = useState(0)

  // Prepare data for monthly income/expense chart
  const monthlyData = transactions.reduce(
    (acc, transaction) => {
      const date = new Date(transaction.date)
      const month = date.toLocaleString("default", { month: "short" })

      if (!acc[month]) {
        acc[month] = { month, income: 0, expense: 0 }
      }

      if (transaction.type === "income") {
        acc[month].income += transaction.amount
      } else {
        acc[month].expense += transaction.amount
      }

      return acc
    },
    {} as Record<string, { month: string; income: number; expense: number }>,
  )

  const barChartData = Object.values(monthlyData)

  // Prepare data for category pie chart
  const pieChartData = Object.entries(categorySummary).map(([name, amount], index) => ({
    name,
    value: amount,
    fill: [
      "#8884d8",
      "#83a6ed",
      "#8dd1e1",
      "#82ca9d",
      "#a4de6c",
      "#d0ed57",
      "#ffc658",
      "#ff8042",
      "#0088FE",
      "#00C49F",
      "#FFBB28",
      "#FF8042",
    ][index % 12],
  }))

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props

    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#999">
          {formatCurrency(value)}
        </text>
        <text x={cx} y={cy} dy={25} textAnchor="middle" fill="#999">
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
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
      </g>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
        <CardDescription>Your income and expenses over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bar">
          <TabsList className="mb-4">
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
          </TabsList>
          <TabsContent value="bar" className="h-[300px]">
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <ChartTooltipContent>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded bg-primary"></div>
                                <span className="text-sm">Income:</span>
                              </div>
                              <span className="text-sm font-medium">{formatCurrency(payload[0].value as number)}</span>
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded bg-muted-foreground"></div>
                                <span className="text-sm">Expense:</span>
                              </div>
                              <span className="text-sm font-medium">{formatCurrency(payload[1].value as number)}</span>
                            </div>
                          </ChartTooltipContent>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="pie" className="h-[300px]">
            <ChartContainer>
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
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
