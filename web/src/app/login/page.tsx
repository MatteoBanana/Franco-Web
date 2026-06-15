import type { Metadata } from 'next'
import { Suspense } from 'react'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Accedi — FRANCO',
  description: 'Accedi al tuo account FRANCO per prenotare, pubblicare e gestire i tuoi scambi.',
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}