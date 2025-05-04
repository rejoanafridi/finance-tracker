import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { MonthlyChart } from "@/components/dashboard/monthly-chart"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Overview of your financial status" />
      <div className="grid gap-6">
        <OverviewCards />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2">
            <MonthlyChart />
          </div>
          <div className="md:col-span-1">
            <RecentTransactions />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
