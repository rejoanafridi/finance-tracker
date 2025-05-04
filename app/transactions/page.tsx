import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { TransactionList } from "@/components/transactions/transaction-list"

export default function TransactionsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Transactions" text="Manage your income and expenses" />
      <TransactionFilters />
      <TransactionList />
    </DashboardShell>
  )
}
