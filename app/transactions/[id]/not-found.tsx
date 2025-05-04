import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Receipt } from "lucide-react"

export default function TransactionNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center space-y-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Receipt className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Transaction not found</h1>
          <p className="text-muted-foreground">The transaction you're looking for doesn't exist or has been deleted.</p>
        </div>
        <Button asChild>
          <Link href="/transactions">View All Transactions</Link>
        </Button>
      </div>
    </div>
  )
}
