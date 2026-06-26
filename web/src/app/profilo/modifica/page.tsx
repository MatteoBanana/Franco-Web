'use client'

// Modifica profilo — form pre-compilato coi dati dell'utente loggato.
// Campi modificabili: nome, città, bio (PATCH /auth/me). Email e avatar
// restano fuori per ora. Dopo il salvataggio rinfresca lo stato auth
// (refreshUser) così profilo e Navbar mostrano subito i nuovi valori.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { updateProfile } from '@/lib/api'
import Navbar from '@/components/Navbar'

export default function ModificaProfiloPage() {
  const { user, isAuthenticated, loading, refreshUser } = useAuth()
  const router = useRouter()

  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [bio, setBio] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Guardia auth.
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?redirect=/profilo/modifica')
    }
  }, [loading, isAuthenticated, router])

  // Pre-compila il form coi dati attuali appena l'utente è disponibile.
  useEffect(() => {
    if (user) {
      setName(user.name ?? '')
      setCity(user.city ?? '')
      setBio(user.bio ?? '')
    }
  }, [user])

  async function handleSubmit() {
    setError(null)
    if (!name.trim()) {
      setError('Il nome non può essere vuoto.')
      return
    }

    setSubmitting(true)
    try {
      await updateProfile({
        name: name.trim(),
        city: city.trim() || null,
        bio: bio.trim() || null,
      })
      await refreshUser()
      router.push('/profilo')
    } catch {
      setError('Salvataggio non riuscito. Riprova.')
      setSubmitting(false)
    }
  }

  const labelStyle = { color: 'var(--ink)' }
  const inputClass = 'w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-colors'
  const inputStyle = { background: 'white', borderColor: '#E5E7EB', color: 'var(--ink)' }

  if (loading || !isAuthenticated || !user) {
    return (
      <>
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-10">
          <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: 'var(--teal-light)' }} />
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
            Modifica profilo
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            Aggiorna le tue informazioni pubbliche.
          </p>
        </header>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Nome</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              maxLength={100} className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Città</label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)}
              placeholder="Es. Padova" maxLength={100} className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)}
              placeholder="Due righe su di te (facoltativo)." rows={4} maxLength={500}
              className={inputClass} style={{ ...inputStyle, resize: 'vertical' }} />
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
            <button type="button" onClick={() => router.push('/profilo')} disabled={submitting}
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