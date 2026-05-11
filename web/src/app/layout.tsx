import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FRANCO — Noleggio tra privati',
  description: 'Presta e prendi in prestito oggetti dai tuoi vicini. Economia circolare, a km zero.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
