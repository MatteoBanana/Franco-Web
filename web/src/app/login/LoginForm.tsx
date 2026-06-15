'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import AuthCard, { authInputClass, authLabelClass } from '@/components/AuthCard'

export default function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      router.replace(redirectTo)
    } catch (err: any) {
      // 401 su credenziali errate, 422 su validazione: in entrambi i casi
      // Laravel popola "message", che mostriamo direttamente all'utente.
      const msg = err?.response?.data?.message
      setError(msg || 'Email o password non corretti. Riprova.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Bentornato"
      subtitle="Accedi per prenotare, pubblicare e gestire i tuoi scambi."
      footer={
        <>
          Non hai ancora un account?{' '}
          <Link href="/registrazione" className="font-semibold" style={{ color: 'var(--teal)' }}>
            Registrati
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
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={authInputClass}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-60"
          style={{ background: 'var(--mustard)', color: 'var(--ink)' }}
        >
          {submitting ? 'Accesso in corso…' : 'Accedi'}
        </button>
      </form>
    </AuthCard>
  )
}