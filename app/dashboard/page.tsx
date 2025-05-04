import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { MonthlyChart } from "@/components/dashboard/monthly-chart"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Overview of your financial status" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <OverviewCards />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-1 md:col-span-1 lg:col-span-4">
          <MonthlyChart />
        </div>
        <div className="col-span-1 md:col-span-1 lg:col-span-3">
          <RecentTransactions />
        </div>
      </div>
    </DashboardShell>
  )
}
