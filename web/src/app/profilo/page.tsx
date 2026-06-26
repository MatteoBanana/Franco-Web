'use client'

// Profilo utente — sola lettura, con accesso alla modifica. Mostra i dati
// dell'utente loggato presi dal contesto auth (useAuth). Il bottone "Modifica
// profilo" porta a /profilo/modifica (PATCH /auth/me). Pagina autenticata con
// guardia: non loggato → /login.

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Navbar from '@/components/Navbar'
import { Inbox, MapPin, Mail, BadgeCheck, Star, Pencil } from 'lucide-react'

const iniziali = (nome: string) =>
  (nome ?? '').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?'

export default function ProfiloPage() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [loading, isAuthenticated, router])

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  if (loading || !isAuthenticated || !user) {
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-10">
          <div className="h-32 rounded-2xl animate-pulse" style={{ background: 'var(--teal-light)' }} />
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-3xl tracking-tight" style={{ color: 'var(--ink)' }}>
            Profilo
          </h1>
          <Link
            href="/profilo/modifica"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
            style={{ background: 'var(--teal-light)', color: 'var(--teal)' }}
          >
            <Pencil size={15} />
            Modifica profilo
          </Link>
        </div>

        {/* Card identità */}
        <section
          className="rounded-2xl p-6 mb-6"
          style={{ background: 'white', border: '1px solid #F0EFEA' }}
        >
          <div className="flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
              style={{ background: 'var(--teal)' }}
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                iniziali(user.name)
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-2xl truncate" style={{ color: 'var(--ink)' }}>
                  {user.name}
                </h2>
                {user.is_verified && (
                  <BadgeCheck size={20} style={{ color: 'var(--teal)' }} aria-label="Verificato" />
                )}
              </div>
              {typeof user.rating_avg === 'number' && user.rating_avg > 0 && (
                <p className="mt-1 flex items-center gap-1 text-sm" style={{ color: 'var(--muted)' }}>
                  <Star size={15} style={{ color: 'var(--mustard)', fill: 'var(--mustard)' }} />
                  {user.rating_avg.toFixed(1)}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="mt-5 text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--ink)' }}>
              {user.bio}
            </p>
          )}

          {/* Dettagli */}
          <div className="mt-6 pt-6 space-y-3 text-sm" style={{ borderTop: '1px solid #F0EFEA' }}>
            <div className="flex items-center gap-3" style={{ color: 'var(--ink)' }}>
              <Mail size={16} style={{ color: 'var(--muted)' }} />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3" style={{ color: 'var(--ink)' }}>
              <MapPin size={16} style={{ color: 'var(--muted)' }} />
              <span>{user.city ? user.city : 'Città non indicata'}</span>
            </div>
            <div className="flex items-center gap-3" style={{ color: 'var(--ink)' }}>
              <BadgeCheck size={16} style={{ color: 'var(--muted)' }} />
              <span>{user.is_verified ? 'Account verificato' : 'Account non verificato'}</span>
            </div>
          </div>
        </section>

        {/* Scorciatoie */}
        <section className="grid gap-3">
          <Link
            href="/prenotazioni"
            className="flex items-center gap-3 rounded-2xl px-5 py-4 transition-colors"
            style={{ background: 'white', border: '1px solid #F0EFEA', color: 'var(--ink)' }}
          >
            <Inbox size={20} style={{ color: 'var(--teal)' }} />
            <div>
              <p className="font-medium">Le mie prenotazioni</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Richieste ricevute e prenotazioni inviate
              </p>
            </div>
          </Link>
        </section>

        {/* Logout */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--terracotta)' }}
          >
            Esci dall’account
          </button>
        </div>
      </main>
    </>
  )
}