export interface Transaction {
    id?: string
    _id?: string
    description: string
    amount: number
    category: string
    categoryId?: string
    type: 'income' | 'expense'
    date: string
    createdAt?: string
    updatedAt?: string
}

export interface Category {
    id: string
    _id?: string
    name: string
    createdAt?: string
}

export interface User {
    id: string
    _id?: string
    name: string
    email: string
}

// Extend next-auth types
declare module 'next-auth' {
    interface User {
        id: string
        _id?: string
        name: string
        email: string
        token?: string
    }

    interface Session {
        user: User
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        _id?: string
    }
}
