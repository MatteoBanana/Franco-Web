'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Search, Home, PlusCircle, ArrowLeftRight, MessageCircle, User, LogOut, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()

  // Iniziali per l'avatar quando manca avatar_url (es. "Mario Rossi" → "MR").
  const initials = (user?.name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('') || '?'

  async function handleLogout() {
    await logout()
    setMobileOpen(false)
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm"
                 style={{ background: 'var(--teal)' }}>
              F
            </div>
            <span className="font-display font-bold text-lg tracking-tight" style={{ color: 'var(--ink)' }}>
              franco
              <span style={{ color: 'var(--terracotta)' }}>.</span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/',          icon: Home,            label: 'Home' },
              { href: '/cerca',     icon: Search,          label: 'Cerca' },
              { href: '/pubblica',  icon: PlusCircle,      label: 'Pubblica' },
              { href: '/scambi',    icon: ArrowLeftRight,  label: 'Scambi' },
              { href: '/messaggi',  icon: MessageCircle,   label: 'Messaggi' },
              { href: '/profilo',   icon: User,            label: 'Profilo' },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--teal-light)'
                  e.currentTarget.style.color = 'var(--teal)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--muted)'
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Durante il bootstrap riserviamo lo spazio per evitare il flicker
                tra stato sloggato e loggato al primo paint. */}
            {loading ? (
              <div className="w-8 h-8" />
            ) : isAuthenticated ? (
              <>
                <Link
                  href="/pubblica"
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: 'var(--mustard)', color: 'var(--ink)' }}
                >
                  + Pubblica
                </Link>
                <Link
                  href="/profilo"
                  title={user?.name}
                  className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'var(--teal)' }}
                >
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--muted)' }}
                  title="Esci"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: 'var(--teal)' }}
                >
                  Accedi
                </Link>
                <Link
                  href="/registrazione"
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: 'var(--mustard)', color: 'var(--ink)' }}
                >
                  Registrati
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
          <div className="px-4 py-3 flex flex-col gap-1">
            {[
              { href: '/',         label: 'Home' },
              { href: '/cerca',    label: 'Cerca' },
              { href: '/pubblica', label: 'Pubblica' },
              { href: '/messaggi', label: 'Messaggi' },
              { href: '/profilo',  label: 'Profilo' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-2.5 rounded-lg text-sm font-medium"
                style={{ color: 'var(--ink)' }}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            {!loading && (
              isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-left"
                  style={{ color: 'var(--terracotta)' }}
                >
                  Esci
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-2.5 rounded-lg text-sm font-medium"
                    style={{ color: 'var(--teal)' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    Accedi
                  </Link>
                  <Link
                    href="/registrazione"
                    className="px-3 py-2.5 rounded-lg text-sm font-semibold"
                    style={{ color: 'var(--ink)' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    Registrati
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </header>
  )
}