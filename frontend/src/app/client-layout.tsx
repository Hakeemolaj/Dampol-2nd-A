'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useEffect, useState } from 'react'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return <>{children}</>
  }

  // Check if current route is an admin route
  const isAdminRoute = pathname.startsWith('/admin')

  // For admin routes, render children directly (admin layout handles its own navigation)
  if (isAdminRoute) {
    return <>{children}</>
  }

  // For public routes, render with header and footer
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
