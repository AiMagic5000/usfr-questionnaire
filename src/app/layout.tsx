import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Client Intake Questionnaire | US Foreclosure Recovery',
  description: 'Complete the client intake questionnaire to begin your surplus funds claim with US Foreclosure Recovery.',
  keywords: 'foreclosure surplus funds, excess proceeds, tax sale surplus, claim recovery, foreclosure recovery',
  openGraph: {
    title: 'Client Intake Questionnaire | US Foreclosure Recovery',
    description: 'Complete the client intake questionnaire to begin your surplus funds claim.',
    type: 'website',
    siteName: 'US Foreclosure Recovery',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
