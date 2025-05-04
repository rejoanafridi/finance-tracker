'use client'

import { useState, useEffect } from 'react'
import { useFinance } from '@/context/finance-context'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Edit, Plus, Trash2, AlertCircle } from 'lucide-react'
import { AddTransactionDialog } from './add-transaction-dialog'
import { EditTransactionDialog } from './edit-transaction-dialog'
import { DeleteTransactionDialog } from './delete-transaction-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from './empty-state'
import { useRouter } from 'next/navigation'

export function TransactionList() {
    const { transactions, filteredTransactions, isLoading, error } =
        useFinance()
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null)
    const [isMounted, setIsMounted] = useState(false)

    const router = useRouter()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleEdit = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setShowEditDialog(true)
    }

    const handleDelete = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setShowDeleteDialog(true)
    }

    if (!isMounted) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle>All Transactions</CardTitle>
                        <CardDescription>Loading...</CardDescription>
                    </div>
                    <Skeleton className="h-10 w-[140px]" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Skeleton className="h-4 w-16" />
                                    </TableHead>
                                    <TableHead>
                                        <Skeleton className="h-4 w-24" />
                                    </TableHead>
                                    <TableHead>
                                        <Skeleton className="h-4 w-20" />
                                    </TableHead>
                                    <TableHead>
                                        <Skeleton className="h-4 w-16" />
                                    </TableHead>
                                    <TableHead>
                                        <Skeleton className="h-4 w-16" />
                                    </TableHead>
                                    <TableHead className="text-right">
                                        <Skeleton className="h-4 w-16 ml-auto" />
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <Skeleton className="h-4 w-24" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-32" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-6 w-20" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-16" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-6 w-16" />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Skeleton className="h-8 w-8" />
                                                <Skeleton className="h-8 w-8" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle>All Transactions</CardTitle>
                        <CardDescription>
                            Loading your transactions...
                        </CardDescription>
                    </div>
                    <Skeleton className="h-10 w-[140px]" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <Skeleton className="h-4 w-24" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-32" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-6 w-20" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-16" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-6 w-16" />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Skeleton className="h-8 w-8" />
                                                <Skeleton className="h-8 w-8" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const displayTransactions =
        filteredTransactions.length > 0 ? filteredTransactions : transactions

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>
                        A list of all your income and expenses
                    </CardDescription>
                </div>
                <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Transaction
                </Button>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {displayTransactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayTransactions.map((transaction) => (
                                    <TableRow
                                        key={transaction?.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() =>
                                            router.push(
                                                `/transactions/${transaction.id}`
                                            )
                                        }
                                    >
                                        <TableCell>
                                            {formatDate(transaction.date)}
                                        </TableCell>
                                        <TableCell>
                                            {transaction.description}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {transaction.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell
                                            className={
                                                transaction.type === 'income'
                                                    ? 'text-green-500'
                                                    : 'text-red-500'
                                            }
                                        >
                                            {transaction.type === 'income'
                                                ? '+'
                                                : '-'}
                                            {formatCurrency(transaction.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    transaction.type ===
                                                    'income'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {transaction.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleEdit(transaction)
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        Edit
                                                    </span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDelete(
                                                            transaction
                                                        )
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        Delete
                                                    </span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <EmptyState onAddClick={() => setShowAddDialog(true)} />
                )}
            </CardContent>
            <AddTransactionDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
            />
            {selectedTransaction && (
                <>
                    <EditTransactionDialog
                        open={showEditDialog}
                        onOpenChange={setShowEditDialog}
                        transaction={selectedTransaction}
                    />
                    <DeleteTransactionDialog
                        open={showDeleteDialog}
                        onOpenChange={setShowDeleteDialog}
                        transaction={selectedTransaction}
                    />
                </>
            )}
        </Card>
    )
}
