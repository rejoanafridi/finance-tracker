import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { BudgetOverview } from "@/components/budgets/budget-overview"
import { BudgetList } from "@/components/budgets/budget-list"

export default function BudgetsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Budgets" text="Set and track your spending limits" />
      <div className="grid gap-6">
        <BudgetOverview />
        <BudgetList />
      </div>
    </DashboardShell>
  )
}
