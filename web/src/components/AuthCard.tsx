import Link from 'next/link'
import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

// Classi condivise dai campi dei form auth, così login e registrazione
// restano visivamente identici senza duplicare le stringhe Tailwind.
export const authInputClass =
  'w-full px-4 py-2.5 rounded-xl border bg-white text-sm outline-none transition ' +
  'border-gray-200 focus:border-[color:var(--teal)] focus:ring-2 focus:ring-[color:var(--teal-light)]'

export const authLabelClass = 'block text-sm font-medium mb-1.5'

export default function AuthCard({ title, subtitle, children, footer }: Props) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: 'var(--bg)' }}>
      {/* Pannello brand — solo desktop */}
      <aside
        className="hidden lg:flex relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'var(--teal)' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-10 border-2 border-white" />
          <div className="absolute -bottom-16 -left-12 w-56 h-56 rounded-full opacity-5 bg-white" />
        </div>

        <Link href="/" className="relative font-display font-bold text-2xl text-white tracking-tight">
          franco<span style={{ color: 'var(--mustard)' }}>.</span>
        </Link>

        <div className="relative">
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Il tuo quartiere<br />è già pieno di cose.
          </h2>
          <p className="text-white opacity-75 text-lg leading-relaxed">
            Prendi in prestito quello che ti serve, presta quello che hai fermo.
            Senza comprare, senza sprecare.
          </p>
        </div>

        <p className="relative text-white opacity-60 text-sm">
          Economia circolare, a km zero.
        </p>
      </aside>

      {/* Colonna form */}
      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="lg:hidden inline-block font-display font-bold text-xl mb-8 tracking-tight"
            style={{ color: 'var(--teal)' }}
          >
            franco<span style={{ color: 'var(--terracotta)' }}>.</span>
          </Link>

          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
            {title}
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
            {subtitle}
          </p>

          {children}

          <p className="text-sm text-center mt-6" style={{ color: 'var(--muted)' }}>
            {footer}
          </p>
        </div>
      </main>
    </div>
  )
}