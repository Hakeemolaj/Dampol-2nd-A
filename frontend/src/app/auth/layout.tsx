import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication - Barangay Dampol 2nd A',
  description: 'Sign in or create an account for Barangay Dampol 2nd A services',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  )
}
