import type { Metadata } from 'next'
import './globals.css'
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
          {children}
          <AppToaster />
        </Providers>
      </body>
    </html>
  )
}
