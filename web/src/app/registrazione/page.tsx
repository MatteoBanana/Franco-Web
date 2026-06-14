import type { Metadata } from 'next'
import { Suspense } from 'react'
import RegistrazioneForm from './RegistrazioneForm'

export const metadata: Metadata = {
  title: 'Registrati — FRANCO',
  description: 'Crea il tuo account FRANCO e inizia a prestare e prendere in prestito nel tuo quartiere.',
}

export default function RegistrazionePage() {
  return (
    <Suspense fallback={null}>
      <RegistrazioneForm />
    </Suspense>
  )
}