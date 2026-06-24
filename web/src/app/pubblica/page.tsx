'use client'

// Pubblica oggetto — form per creare un nuovo annuncio (POST /listings).
// Pagina autenticata: guardia via useAuth. La posizione (lat/lng, obbligatori
// lato backend) si ottiene con la geolocalizzazione del browser ("usa la mia
// posizione"). Niente upload immagini per ora: l'oggetto nasce senza foto.
// Flusso: createListing() crea l'oggetto in stato 'draft', poi updateListing()
// lo porta subito ad 'active' così è online e prenotabile (auto-attivazione).

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getCategories, createListing, updateListing, type Category } from '@/lib/api'
import Navbar from '@/components/Navbar'
import { MapPin, Loader2, Check } from 'lucide-react'

type Condizione = 'new' | 'excellent' | 'good' | 'fair'

const CONDIZIONI: { value: Condizione; label: string }[] = [
  { value: 'new',       label: 'Nuovo' },
  { value: 'excellent', label: 'Ottime condizioni' },
  { value: 'good',      label: 'Buone condizioni' },
  { value: 'fair',      label: 'Condizioni discrete' },
]

export default function PubblicaPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  // Categorie dal backend (endpoint GET /categories).
  const [categorie, setCategorie] = useState<Category[]>([])

  // Campi del form.
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [pricePerDay, setPricePerDay] = useState('')
  const [deposit, setDeposit] = useState('')
  const [condition, setCondition] = useState<Condizione>('good')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  // Stati UI.
  const [locating, setLocating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Guardia auth.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?redirect=/pubblica')
    }
  }, [authLoading, isAuthenticated, router])

  // Carica le categorie.
  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    getCategories()
      .then(res => setCategorie(res.data))
      .catch(() => setError('Non è stato possibile caricare le categorie.'))
  }, [authLoading, isAuthenticated])

  // Geolocalizzazione.
  function rilevaPosizione() {
    if (!navigator.geolocation) {
      setError('Il browser non supporta la geolocalizzazione.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        setError('Non è stato possibile rilevare la posizione. Controlla i permessi del browser.')
        setLocating(false)
      }
    )
  }

  // Validazione lato client prima dell'invio.
  function validazione(): string | null {
    if (!title.trim()) return 'Inserisci un titolo.'
    if (!description.trim()) return 'Inserisci una descrizione.'
    if (categoryId === '') return 'Scegli una categoria.'
    const prezzo = Number(pricePerDay)
    if (!prezzo || prezzo < 1) return 'Inserisci un prezzo giornaliero valido (almeno 1 €).'
    if (!city.trim()) return 'Inserisci la città.'
    if (!address.trim()) return 'Inserisci un indirizzo.'
    if (!coords) return 'Rileva la posizione prima di pubblicare.'
    return null
  }

  async function handleSubmit() {
    setError(null)
    const erroreValidazione = validazione()
    if (erroreValidazione) {
      setError(erroreValidazione)
      return
    }

    setSubmitting(true)
    try {
      // 1. Crea l'oggetto (nasce 'draft').
      const { listing } = await createListing({
        category_id: Number(categoryId),
        title: title.trim(),
        description: description.trim(),
        price_per_day: Number(pricePerDay),
        deposit: deposit ? Number(deposit) : 0,
        condition,
        lat: coords!.lat,
        lng: coords!.lng,
        address: address.trim(),
        city: city.trim(),
      })

      // 2. Auto-attivazione: lo porta ad 'active' così è subito online.
      await updateListing(listing.id, { status: 'active' })

      // 3. Vai alla pagina del nuovo oggetto.
      router.push(`/oggetto/${listing.id}`)
    } catch {
      setError('Pubblicazione non riuscita. Controlla i dati e riprova.')
      setSubmitting(false)
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <>
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-10">
          <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: 'var(--teal-light)' }} />
        </main>
      </>
    )
  }

  const labelStyle = { color: 'var(--ink)' }
  const inputClass = 'w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-colors'
  const inputStyle = { background: 'white', borderColor: '#E5E7EB', color: 'var(--ink)' }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="font-display font-bold text-3xl tracking-tight" style={{ color: 'var(--ink)' }}>
            Pubblica un oggetto
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            Mettilo a disposizione dei tuoi vicini. Bastano pochi dettagli.
          </p>
        </header>

        <div className="space-y-5">
          {/* Titolo */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Titolo</label>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Es. Trapano avvitatore Bosch 18V"
              maxLength={120} className={inputClass} style={inputStyle}
            />
          </div>

          {/* Descrizione */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Descrizione</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Racconta com'è fatto, cosa include, eventuali note d'uso."
              rows={4} maxLength={2000}
              className={inputClass} style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Categoria</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : '')}
              className={inputClass} style={inputStyle}
            >
              <option value="">Scegli una categoria…</option>
              {categorie.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Prezzo + Cauzione */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Prezzo al giorno (€)</label>
              <input
                type="number" min="1" max="9999" value={pricePerDay}
                onChange={e => setPricePerDay(e.target.value)}
                placeholder="10" className={inputClass} style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Cauzione (€)</label>
              <input
                type="number" min="0" max="9999" value={deposit}
                onChange={e => setDeposit(e.target.value)}
                placeholder="0 (facoltativa)" className={inputClass} style={inputStyle}
              />
            </div>
          </div>

          {/* Condizione */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Condizione</label>
            <select
              value={condition} onChange={e => setCondition(e.target.value as Condizione)}
              className={inputClass} style={inputStyle}
            >
              {CONDIZIONI.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Città + Indirizzo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Città</label>
              <input
                type="text" value={city} onChange={e => setCity(e.target.value)}
                placeholder="Es. Bologna" maxLength={100}
                className={inputClass} style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Indirizzo</label>
              <input
                type="text" value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Es. Via Roma 1" maxLength={200}
                className={inputClass} style={inputStyle}
              />
            </div>
          </div>

          {/* Posizione */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Posizione</label>
            <button
              type="button" onClick={rilevaPosizione} disabled={locating}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
              style={coords
                ? { background: 'var(--teal-light)', color: 'var(--teal)' }
                : { background: 'white', border: '1px solid #E5E7EB', color: 'var(--ink)' }}
            >
              {locating ? <Loader2 size={16} className="animate-spin" /> : coords ? <Check size={16} /> : <MapPin size={16} />}
              {locating ? 'Rilevamento…' : coords ? 'Posizione rilevata' : 'Usa la mia posizione'}
            </button>
            {coords && (
              <p className="mt-1.5 text-xs" style={{ color: 'var(--muted)' }}>
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </p>
            )}
          </div>

          {/* Errore */}
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#FDEDE7', color: 'var(--terracotta)' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="button" onClick={handleSubmit} disabled={submitting}
            className="w-full py-3 rounded-xl text-sm font-bold transition-opacity disabled:opacity-50"
            style={{ background: 'var(--mustard)', color: 'var(--ink)' }}
          >
            {submitting ? 'Pubblicazione…' : 'Pubblica oggetto'}
          </button>
        </div>
      </main>
    </>
  )
}