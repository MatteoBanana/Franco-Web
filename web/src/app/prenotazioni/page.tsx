'use client'

// Prenotazioni — pagina unica a due tab:
//  - "Ricevute" (owner):  richieste sui propri oggetti, con conferma/rifiuto.
//  - "Inviate"  (renter): prenotazioni fatte dall'utente, sola lettura.
// Pagina autenticata: guardia via useAuth. Ogni tab fa il suo fetch (owner/renter)
// la prima volta che viene aperta, poi il risultato resta in cache per la sessione.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getBookings, updateBookingStatus, type Booking } from '@/lib/api'
import Navbar from '@/components/Navbar'
import RichiestaCard from './RichiestaCard'

type Tab = 'owner' | 'renter'

export default function PrenotazioniPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  const [tab, setTab] = useState<Tab>('owner')

  // Cache separata per ruolo: null = non ancora caricata.
  const [datiOwner, setDatiOwner] = useState<Booking[] | null>(null)
  const [datiRenter, setDatiRenter] = useState<Booking[] | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Guardia: a bootstrap finito, se non loggato → login.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch della tab attiva, solo se non è già in cache.
  useEffect(() => {
    if (authLoading || !isAuthenticated) return

    const giaInCache = tab === 'owner' ? datiOwner !== null : datiRenter !== null
    if (giaInCache) return

    let attivo = true
    setLoading(true)
    setError(null)
    getBookings(tab)
      .then(res => {
        if (!attivo) return
        if (tab === 'owner') {
          setDatiOwner(res.data)
        } else {
                  setDatiRenter(res.data)
        }
      })
      .catch(() => {
        if (attivo) setError('Non è stato possibile caricare le prenotazioni. Riprova.')
      })
      .finally(() => {
        if (attivo) setLoading(false)
      })

    return () => {
      attivo = false
    }
  }, [tab, authLoading, isAuthenticated, datiOwner, datiRenter])

  // Conferma/rifiuto (solo owner) con update ottimistico e rollback su errore.
  async function handleUpdate(id: number, status: 'confirmed' | 'rejected') {
    const precedente = datiOwner
    setDatiOwner(bs => (bs ? bs.map(b => (b.id === id ? { ...b, status } : b)) : bs))

    try {
      await updateBookingStatus(id, status)
    } catch {
      setDatiOwner(precedente) // rollback
      setError('Aggiornamento non riuscito. Riprova.')
    }
  }

  const dati = tab === 'owner' ? datiOwner : datiRenter

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
        <header className="mb-6">
          <h1 className="font-display font-bold text-3xl tracking-tight" style={{ color: 'var(--ink)' }}>
            Prenotazioni
          </h1>
        </header>

        {/* Tab */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit" style={{ background: '#F0EFEA' }}>
          {([
            { key: 'owner' as Tab,  label: 'Ricevute' },
            { key: 'renter' as Tab, label: 'Inviate' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={
                tab === key
                  ? { background: 'white', color: 'var(--ink)' }
                  : { background: 'transparent', color: 'var(--muted)' }
              }
            >
              {label}
            </button>
          ))}
        </div>

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

        {!loading && !error && dati && dati.length === 0 && (
          <div className="rounded-2xl px-6 py-12 text-center" style={{ background: 'white', border: '1px solid #F0EFEA' }}>
            <p className="font-display text-xl" style={{ color: 'var(--ink)' }}>
              {tab === 'owner' ? 'Ancora nessuna richiesta' : 'Non hai ancora prenotato nulla'}
            </p>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
              {tab === 'owner'
                ? 'Quando qualcuno prenoterà un tuo oggetto, lo troverai qui.'
                : 'Le prenotazioni che fai sugli oggetti degli altri compaiono qui.'}
            </p>
          </div>
        )}

        {!loading && !error && dati && dati.length > 0 && (
          <ul className="space-y-4">
            {dati.map(b => (
              <RichiestaCard
                key={b.id}
                booking={b}
                variant={tab}
                onUpdate={tab === 'owner' ? handleUpdate : undefined}
              />
            ))}
          </ul>
        )}
      </main>
    </>
  )
}