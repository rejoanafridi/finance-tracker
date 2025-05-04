import { notFound } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { TransactionDetail } from "@/components/transactions/transaction-detail"
import { connectToDatabase } from "@/lib/db"
import { Transaction } from "@/models/transaction"
import { auth } from "@/lib/auth"

interface TransactionPageProps {
  params: {
    id: string
  }
}

export default async function TransactionPage({ params }: TransactionPageProps) {
  try {
    await connectToDatabase()
    const user = await auth()

    if (!user) {
      return notFound()
    }

    const transaction = await Transaction.findOne({
      _id: params.id,
      userId: user.id,
    })

    if (!transaction) {
      return notFound()
    }

    return (
      <DashboardShell>
        <DashboardHeader heading="Transaction Details" text="View and manage transaction information" />
        <TransactionDetail
          transaction={{
            id: transaction._id.toString(),
            description: transaction.description,
            amount: transaction.amount,
            category: transaction.category,
            type: transaction.type,
            date: transaction.date.toISOString(),
            createdAt: transaction.createdAt?.toISOString(),
            updatedAt: transaction.updatedAt?.toISOString(),
          }}
        />
      </DashboardShell>
    )
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return notFound()
  }
}
