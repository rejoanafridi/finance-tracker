import { Suspense } from 'react'
import ResetPasswordPage from './page'

const ResetLayout = () => {
    return (
        <Suspense
            fallback={
                <div className="flex h-screen items-center justify-center">
                    Loading...
                </div>
            }
        >
            <ResetPasswordPage />
        </Suspense>
    )
}

export default ResetLayout
