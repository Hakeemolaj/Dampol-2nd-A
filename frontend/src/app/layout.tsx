import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./client-layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Barangay Web Application",
    template: "%s | Barangay Web Application"
  },
  description: "Official website of the Barangay providing digital services for residents including document requests, announcements, and community information.",
  keywords: ["barangay", "local government", "philippines", "civic services", "documents", "permits"],
  authors: [{ name: "Barangay Development Team" }],
  creator: "Barangay Web Application",
  publisher: "Local Government Unit",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "Barangay Web Application",
    description: "Official website providing digital services for barangay residents",
    siteName: "Barangay Web Application",
  },
  twitter: {
    card: "summary_large_image",
    title: "Barangay Web Application",
    description: "Official website providing digital services for barangay residents",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
