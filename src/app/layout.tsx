import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import AppToaster from '@/components/AppToaster'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Computer Management Dashboard - Apni Pathshala',
  description: 'Manage and monitor computer assets deployed across PODs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <Providers>
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
          <AppToaster />
        </Providers>
      </body>
    </html>
  )
}
