'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Announcements', href: '/announcements' },
  { name: 'Feedback', href: '/feedback' },
  { name: 'Surveys', href: '/surveys' },
  { name: 'Officials', href: '/officials' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

const emergencyItems = [
  { name: 'Emergency Hotline', href: '/emergency', phone: '911' },
  { name: 'Barangay Hotline', href: '/contact', phone: '(044) 815-1234' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>

      <header className="government-header sticky top-0 z-40 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Branding */}
            <div className="flex items-center min-w-0 flex-shrink-0">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <span className="text-primary-600 font-bold text-lg">🏛️</span>
                </div>
                <div className="hidden sm:block min-w-0">
                  <h1 className="text-lg font-bold text-white leading-tight">
                    Barangay Dampol 2nd A
                  </h1>
                  <p className="text-xs text-primary-100 font-medium">
                    Local Government Unit
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1" aria-label="Main navigation">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-primary-100 hover:text-white hover:bg-primary-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Emergency and User Actions */}
            <div className="flex items-center space-x-3">
              {/* Emergency Button */}
              <div className="hidden xl:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-error-600 border-error-600 text-white hover:bg-error-700 hover:border-error-700 font-semibold shadow-sm"
                  asChild
                >
                  <Link href="/emergency">
                    🚨 Emergency
                  </Link>
                </Button>
              </div>

              {/* Search Button */}
              <button
                type="button"
                className="text-primary-100 hover:text-white hover:bg-primary-600 p-2 rounded-lg transition-all duration-200"
                aria-label="Search"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center space-x-2 text-primary-100 hover:text-white hover:bg-primary-600 p-2 rounded-lg transition-all duration-200"
                    aria-label="User menu"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center shadow-sm">
                      <span className="text-sm font-semibold text-white">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-medium">
                      {user.email}
                    </span>
                  </button>
                  {/* User dropdown would go here */}
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-primary-700 border-white hover:bg-primary-50 font-semibold shadow-sm"
                  asChild
                >
                  <Link href="/auth/login">
                    Sign In
                  </Link>
                </Button>
              )}

              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden text-primary-100 hover:text-white hover:bg-primary-600 p-2 rounded-lg transition-all duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle mobile menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-primary-800 border-t border-primary-600 shadow-lg">
            <div className="px-4 pt-4 pb-3 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-primary-100 hover:text-white hover:bg-primary-700 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Emergency contacts in mobile menu */}
              <div className="border-t border-primary-600 pt-4 mt-4">
                <p className="text-primary-200 text-sm font-semibold px-4 mb-2">Emergency Contacts</p>
                {emergencyItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-error-200 hover:text-error-100 hover:bg-primary-700 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center justify-between">
                      <span>🚨 {item.name}</span>
                      <span className="text-sm font-semibold">{item.phone}</span>
                    </span>
                  </Link>
                ))}
              </div>

              {/* User actions in mobile menu */}
              {user ? (
                <div className="border-t border-primary-600 pt-4 mt-4">
                  <div className="px-4 py-3">
                    <p className="text-primary-200 text-sm">Signed in as</p>
                    <p className="text-white text-base font-semibold">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="text-primary-100 hover:text-white hover:bg-primary-700 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📊 Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-primary-100 hover:text-white hover:bg-primary-700 block px-4 py-3 rounded-lg text-base font-medium w-full text-left transition-all duration-200"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t border-primary-600 pt-4 mt-4">
                  <Link
                    href="/auth/login"
                    className="text-primary-100 hover:text-white hover:bg-primary-700 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🔐 Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-primary-100 hover:text-white hover:bg-primary-700 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📝 Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  )
}
