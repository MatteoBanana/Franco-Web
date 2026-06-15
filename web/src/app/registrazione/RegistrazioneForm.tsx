'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import AuthCard, { authInputClass, authLabelClass } from '@/components/AuthCard'

export default function RegistrazioneForm() {
  const { register } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register(name, email, password)
      router.replace(redirectTo)
    } catch (err: any) {
      // 422 di validazione: "message" contiene il riassunto, "errors" il
      // dettaglio per campo. Mostriamo il primo errore utile disponibile.
      const data = err?.response?.data
      const firstFieldError = data?.errors && (Object.values(data.errors)[0] as string[])?.[0]
      setError(firstFieldError || data?.message || 'Registrazione non riuscita. Riprova.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Crea il tuo account"
      subtitle="Bastano pochi secondi per iniziare a scambiare con i tuoi vicini."
      footer={
        <>
          Hai già un account?{' '}
          <Link href="/login" className="font-semibold" style={{ color: 'var(--teal)' }}>
            Accedi
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="text-sm rounded-xl px-4 py-3"
            style={{ background: '#FBE9E7', color: 'var(--terracotta)' }}
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className={authLabelClass} style={{ color: 'var(--ink)' }}>
            Nome
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className={authInputClass}
            placeholder="Mario Rossi"
          />
        </div>

        <div>
          <label htmlFor="email" className={authLabelClass} style={{ color: 'var(--ink)' }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={authInputClass}
            placeholder="tu@esempio.it"
          />
        </div>

        <div>
          <label htmlFor="password" className={authLabelClass} style={{ color: 'var(--ink)' }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={authInputClass}
            placeholder="Almeno 8 caratteri"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-60"
          style={{ background: 'var(--mustard)', color: 'var(--ink)' }}
        >
          {submitting ? 'Creazione account…' : 'Registrati'}
        </button>
      </form>
    </AuthCard>
  )
}