'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

const adminNavigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: '📊',
    description: 'Overview and statistics'
  },
  {
    name: 'Document Processing',
    href: '/admin/documents',
    icon: '📄',
    description: 'Manage document requests'
  },
  {
    name: 'Resident Management',
    href: '/admin/residents',
    icon: '👥',
    description: 'Resident database'
  },
  {
    name: 'Incident Management',
    href: '/admin/incidents',
    icon: '🚨',
    description: 'Blotter and incident reports'
  },
  {
    name: 'Live Streaming',
    href: '/admin/streaming',
    icon: '🎥',
    description: 'Manage live streams & broadcasts'
  },
  {
    name: 'Announcements',
    href: '/admin/announcements',
    icon: '📢',
    description: 'Community communications'
  },
  {
    name: 'Feedback Management',
    href: '/admin/feedback',
    icon: '💬',
    description: 'Community feedback & suggestions'
  },
  {
    name: 'Surveys & Polls',
    href: '/admin/surveys',
    icon: '📊',
    description: 'Community surveys & polls'
  },
  {
    name: 'Financial Management',
    href: '/admin/finance',
    icon: '💰',
    description: 'Budget and expenses'
  },
  {
    name: 'Reports & Analytics',
    href: '/admin/reports',
    icon: '📈',
    description: 'Data and insights'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: '⚙️',
    description: 'System configuration'
  }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-primary-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">🏛️</span>
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 leading-tight">Admin Panel</h2>
                <p className="text-xs text-primary-600 font-medium">Dampol 2nd A</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-3 transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-600'
                  }`}>
                    <span className="text-lg" aria-hidden="true">
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </div>
                    <div className={`text-xs mt-0.5 ${
                      isActive ? 'text-white/80' : 'text-gray-500 group-hover:text-primary-600'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">BC</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">Barangay Captain</p>
                <p className="text-xs text-gray-600 truncate">captain@dampol2nda.gov.ph</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs font-medium hover:bg-primary-50 hover:border-primary-200">
                <span className="mr-2">👤</span>
                Profile Settings
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-700">
                <span className="mr-2">🚪</span>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  Barangay Dampol 2nd A
                </h1>
                <p className="text-sm text-primary-600 font-medium">
                  Administrative System
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Quick Actions */}
              <Button
                variant="outline"
                size="sm"
                className="hidden xl:flex items-center space-x-2 bg-error-50 border-error-200 text-error-700 hover:bg-error-100 font-medium"
              >
                <span>🚨</span>
                <span>Emergency</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hidden lg:flex items-center space-x-2 bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100 font-medium"
              >
                <span>📢</span>
                <span className="hidden xl:inline">Announce</span>
              </Button>

              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v2.25a2.25 2.25 0 0 1-2.25 2.25H7.5a2.25 2.25 0 0 1-2.25-2.25V9.75a6 6 0 0 1 6-6z" />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    3
                  </span>
                </Button>
              </div>

              {/* Back to Public Site */}
              <Button variant="outline" size="sm" asChild className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 font-medium">
                <Link href="/" className="flex items-center space-x-2">
                  <span>🏠</span>
                  <span className="hidden sm:inline">Public Site</span>
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
