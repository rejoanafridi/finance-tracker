import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Transaction } from '@/models/transaction'
import { auth } from '@/lib/auth'

// Get a specific transaction
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase()
        const user = await auth()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const transaction = await Transaction.findOne({
            _id: params.id,
            userId: user.id
        })

        if (!transaction) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(transaction)
    } catch (error) {
        console.error('Error fetching transaction:', error)
        return NextResponse.json(
            { error: 'Failed to fetch transaction' },
            { status: 500 }
        )
    }
}

// // Update a transaction
// export async function PUT(req: Request, { params }: {  params: { id: string } }) {
//   try {
//     await connectToDatabase()
//     const user = await auth()
//     console.log(params)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const data = await req.json()
//     const transaction = await Transaction.findOneAndUpdate({ _id: params.id, userId: user.id }, data, { new: true })

//     if (!transaction) {
//       return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
//     }

//     return NextResponse.json({ message: "Transaction updated successfully", transaction })
//   } catch (error) {
//     console.error("Error updating transaction:", error)
//     return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
//   }
// }

export async function PUT(req: Request, context: { params: { id: string } }) {
    try {
        await connectToDatabase()

        // Await params first before any dynamic operations
        const { id } = await context.params

        const user = await auth() // Now using auth() after resolving params

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.json()
        const transaction = await Transaction.findOneAndUpdate(
            { _id: id, userId: user.id }, // Use the resolved id
            data,
            { new: true }
        )

        if (!transaction) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            message: 'Transaction updated successfully',
            transaction
        })
    } catch (error) {
        console.error('Error updating transaction:', error)
        return NextResponse.json(
            { error: 'Failed to update transaction' },
            { status: 500 }
        )
    }
}
// Delete a transaction
export async function DELETE(
    req: Request,
    context: { params: { id: string } }
) {
    try {
        await connectToDatabase()
        const { id } = await context.params
        const user = await auth()

        const transaction = await Transaction.findOneAndDelete({
            _id: id,
            userId: user.id
        })

        if (!transaction) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            message: 'Transaction deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting transaction:', error)
        return NextResponse.json(
            { error: 'Failed to delete transaction' },
            { status: 500 }
        )
    }
}
