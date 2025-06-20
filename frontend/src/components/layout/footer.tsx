import React from 'react'
import Link from 'next/link'

const footerNavigation = {
  services: [
    { name: 'Document Requests', href: '/services/documents' },
    { name: 'Business Permits', href: '/services/permits' },
    { name: 'Certificates', href: '/services/certificates' },
    { name: 'Emergency Services', href: '/emergency' },
  ],
  information: [
    { name: 'Announcements', href: '/announcements' },
    { name: 'Community Feedback', href: '/feedback' },
    { name: 'Surveys & Polls', href: '/surveys' },
    { name: 'Barangay Officials', href: '/officials' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact Information', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Freedom of Information', href: '/foi' },
    { name: 'Accessibility', href: '/accessibility' },
  ],
  social: [
    {
      name: 'Facebook',
      href: '#',
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'Twitter',
      href: '#',
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: 'Email',
      href: 'mailto:dampol2nda@pulilan.gov.ph',
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ],
}

export function Footer() {
  const currentYear = new Date().getFullYear()
  const barangayName = process.env.NEXT_PUBLIC_BARANGAY_NAME || 'Barangay Web Application'

  return (
    <footer className="bg-gray-900 text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Branding and Contact */}
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">🏛️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{barangayName}</h3>
                <p className="text-sm text-gray-300">Local Government Unit</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Contact Information
                </h4>
                <div className="mt-2 space-y-2 text-sm text-gray-400">
                  <p>📍 Dampol 2nd A, Pulilan, Bulacan</p>
                  <p>📞 Office: (044) 815-1234</p>
                  <p>📧 Email: dampol2nda@pulilan.gov.ph</p>
                  <p>🕒 Hours: Monday-Friday 8:00 AM - 5:00 PM</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Emergency Contacts
                </h4>
                <div className="mt-2 space-y-2 text-sm text-gray-400">
                  <p>🚨 Emergency Hotline: 911</p>
                  <p>📞 Barangay Hotline: (044) 815-1234</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-6">
              {footerNavigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                  aria-label={`Follow us on ${item.name}`}
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Services
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  {footerNavigation.services.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-base text-gray-400 hover:text-white transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Information
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  {footerNavigation.information.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-base text-gray-400 hover:text-white transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Legal & Compliance
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  {footerNavigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-base text-gray-400 hover:text-white transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-700 pt-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <p className="text-xs text-gray-400">
                Data Privacy Act 2012 Compliant
              </p>
              <p className="text-xs text-gray-400">
                WCAG 2.0 AA Accessible
              </p>
            </div>
            
            <p className="mt-8 text-xs text-gray-400 md:order-1 md:mt-0">
              &copy; {currentYear} {barangayName}. All rights reserved. 
              Built with ❤️ for Philippine Local Government Units.
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              This website is an official government website of {barangayName}.
              Information and services provided are for residents and stakeholders.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
