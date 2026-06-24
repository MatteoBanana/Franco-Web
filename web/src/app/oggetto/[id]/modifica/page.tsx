'use client'

// Modifica oggetto — form pre-compilato coi dati attuali dell'annuncio.
// Solo il proprietario può modificare: guardia auth + verifica che l'oggetto
// sia suo (e comunque la policy backend blocca con 403 chi non lo possiede).
// Carica i dati con getListing(id), salva con updateListing(id, {...}).

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getListing, updateListing, type Category } from '@/lib/api'
import Navbar from '@/components/Navbar'

type Condizione = 'new' | 'excellent' | 'good' | 'fair'
type Stato = 'active' | 'paused'

const CONDIZIONI: { value: Condizione; label: string }[] = [
  { value: 'new',       label: 'Nuovo' },
  { value: 'excellent', label: 'Ottime condizioni' },
  { value: 'good',      label: 'Buone condizioni' },
  { value: 'fair',      label: 'Condizioni discrete' },
]

export default function ModificaOggettoPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  // Campi del form.
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pricePerDay, setPricePerDay] = useState('')
  const [deposit, setDeposit] = useState('')
  const [condition, setCondition] = useState<Condizione>('good')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [status, setStatus] = useState<Stato>('active')

  // Stati UI.
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  // Guardia auth.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?redirect=/oggetto/${id}/modifica`)
    }
  }, [authLoading, isAuthenticated, router, id])

  // Carica i dati attuali dell'oggetto e pre-compila il form.
  useEffect(() => {
    if (authLoading || !isAuthenticated) return

    let attivo = true
    setLoadingData(true)
    getListing(id)
      .then(res => {
        if (!attivo) return
        const l = res.listing

        // Verifica proprietà: se l'oggetto non è dell'utente loggato, non può modificarlo.
        if (l.owner && user && l.owner.id !== user.id) {
          setError('Non puoi modificare un oggetto che non è tuo.')
          setLoadingData(false)
          return
        }

        setTitle(l.title ?? '')
        setDescription(l.description ?? '')
        setPricePerDay(String(Number(l.price_per_day)))
        setDeposit(String(Number(l.deposit)))
        setCondition((l.condition as Condizione) ?? 'good')
        setAddress(l.address ?? '')
        setCity(l.city ?? '')
        // Lo stato 'draft' lo trattiamo come 'active' nel selettore (semplifichiamo a active/paused).
        setStatus(l.status === 'paused' ? 'paused' : 'active')
        setLoadingData(false)
      })
      .catch(() => {
        if (attivo) {
          setNotFound(true)
          setLoadingData(false)
        }
      })

    return () => {
      attivo = false
    }
  }, [authLoading, isAuthenticated, id, user])

  function validazione(): string | null {
    if (!title.trim()) return 'Inserisci un titolo.'
    if (!description.trim()) return 'Inserisci una descrizione.'
    const prezzo = Number(pricePerDay)
    if (!prezzo || prezzo < 1) return 'Inserisci un prezzo giornaliero valido (almeno 1 €).'
    if (!city.trim()) return 'Inserisci la città.'
    if (!address.trim()) return 'Inserisci un indirizzo.'
    return null
  }

  async function handleSubmit() {
    setError(null)
    const err = validazione()
    if (err) {
      setError(err)
      return
    }

    setSubmitting(true)
    try {
      await updateListing(id, {
        title: title.trim(),
        description: description.trim(),
        price_per_day: Number(pricePerDay),
        deposit: deposit ? Number(deposit) : 0,
        condition,
        address: address.trim(),
        city: city.trim(),
        status,
      })
      router.push(`/oggetto/${id}`)
    } catch {
      setError('Salvataggio non riuscito. Controlla i dati e riprova.')
      setSubmitting(false)
    }
  }

  const labelStyle = { color: 'var(--ink)' }
  const inputClass = 'w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-colors'
  const inputStyle = { background: 'white', borderColor: '#E5E7EB', color: 'var(--ink)' }

  // Schermata di caricamento / guardia.
  if (authLoading || !isAuthenticated || loadingData) {
    return (
      <>
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-10">
          <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: 'var(--teal-light)' }} />
        </main>
      </>
    )
  }

  // Oggetto inesistente.
  if (notFound) {
    return (
      <>
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-10">
          <p className="font-display text-xl" style={{ color: 'var(--ink)' }}>Oggetto non trovato</p>
        </main>
      </>
    )
  }

  // Errore di proprietà (non è tuo): mostriamo solo il messaggio, niente form.
  if (error && !submitting && title === '') {
    return (
      <>
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-10">
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#FDEDE7', color: 'var(--terracotta)' }}>
            {error}
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="font-display font-bold text-3xl tracking-tight" style={{ color: 'var(--ink)' }}>
            Modifica oggetto
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            Aggiorna i dettagli del tuo annuncio.
          </p>
        </header>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Titolo</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              maxLength={120} className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Descrizione</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={4} maxLength={2000} className={inputClass} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Prezzo al giorno (€)</label>
              <input type="number" min="1" max="9999" value={pricePerDay}
                onChange={e => setPricePerDay(e.target.value)} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Cauzione (€)</label>
              <input type="number" min="0" max="9999" value={deposit}
                onChange={e => setDeposit(e.target.value)} className={inputClass} style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Condizione</label>
            <select value={condition} onChange={e => setCondition(e.target.value as Condizione)}
              className={inputClass} style={inputStyle}>
              {CONDIZIONI.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Città</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)}
                maxLength={100} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Indirizzo</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                maxLength={200} className={inputClass} style={inputStyle} />
            </div>
          </div>

          {/* Stato dell'annuncio */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Stato</label>
            <select value={status} onChange={e => setStatus(e.target.value as Stato)}
              className={inputClass} style={inputStyle}>
              <option value="active">Attivo (visibile e prenotabile)</option>
              <option value="paused">In pausa (nascosto)</option>
            </select>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#FDEDE7', color: 'var(--terracotta)' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-opacity disabled:opacity-50"
              style={{ background: 'var(--mustard)', color: 'var(--ink)' }}>
              {submitting ? 'Salvataggio…' : 'Salva modifiche'}
            </button>
            <button type="button" onClick={() => router.push(`/oggetto/${id}`)} disabled={submitting}
              className="px-5 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              style={{ background: 'white', border: '1px solid #E5E7EB', color: 'var(--muted)' }}>
              Annulla
            </button>
          </div>
        </div>
      </main>
    </>
  )
}