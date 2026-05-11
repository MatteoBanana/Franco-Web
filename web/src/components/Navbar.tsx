'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Search, Home, PlusCircle, ArrowLeftRight, MessageCircle, User, LogOut, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

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
            <Link
              href="/pubblica"
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: 'var(--mustard)', color: 'var(--ink)' }}
            >
              + Pubblica
            </Link>
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'var(--teal)' }}
            >
              MR
            </button>
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
          </div>
        </div>
      )}
    </header>
  )
}
