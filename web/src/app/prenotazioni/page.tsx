'use client'

// Dashboard proprietario — richieste di prenotazione ricevute sui propri oggetti.
// Pagina autenticata: guardia via useAuth, lista via getBookings('owner'), azioni
// di conferma/rifiuto con update ottimistico (la UI cambia subito, e se l'API
// fallisce torniamo indietro).

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getBookings, updateBookingStatus, type Booking } from '@/lib/api'
import Navbar from '@/components/Navbar'
import RichiestaCard from './RichiestaCard'

export default function PrenotazioniPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Guardia: a bootstrap finito, se non loggato → login.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch richieste ricevute.
  useEffect(() => {
    if (authLoading || !isAuthenticated) return

    let attivo = true
    setLoading(true)
    getBookings('owner')
      .then(res => {
        if (attivo) setBookings(res.data)
      })
      .catch(() => {
        if (attivo) setError('Non è stato possibile caricare le richieste. Riprova.')
      })
      .finally(() => {
        if (attivo) setLoading(false)
      })

    return () => {
      attivo = false
    }
  }, [authLoading, isAuthenticated])

  // Conferma/rifiuto con update ottimistico: cambiamo subito lo stato in lista,
  // e se l'API fallisce ripristiniamo la versione precedente mostrando l'errore.
  async function handleUpdate(id: number, status: 'confirmed' | 'rejected') {
    const precedente = bookings
    setBookings(bs => bs.map(b => (b.id === id ? { ...b, status } : b)))

    try {
      await updateBookingStatus(id, status)
    } catch {
      setBookings(precedente) // rollback
      setError('Aggiornamento non riuscito. Riprova.')
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-10">
          <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: 'var(--teal-light)' }} />
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="font-display font-bold text-3xl tracking-tight" style={{ color: 'var(--ink)' }}>
            Richieste ricevute
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            Le prenotazioni che altri hanno richiesto sui tuoi oggetti. Confermale o rifiutale.
          </p>
        </header>

        {loading && (
          <div className="space-y-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: 'var(--teal-light)' }} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl px-5 py-4 text-sm" style={{ background: '#FDEDE7', color: 'var(--terracotta)' }}>
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-2xl px-6 py-12 text-center" style={{ background: 'white', border: '1px solid #F0EFEA' }}>
            <p className="font-display text-xl" style={{ color: 'var(--ink)' }}>Ancora nessuna richiesta</p>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
              Quando qualcuno prenoterà un tuo oggetto, lo troverai qui.
            </p>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <ul className="space-y-4">
            {bookings.map(b => (
              <RichiestaCard key={b.id} booking={b} onUpdate={handleUpdate} />
            ))}
          </ul>
        )}
      </main>
    </>
  )
}