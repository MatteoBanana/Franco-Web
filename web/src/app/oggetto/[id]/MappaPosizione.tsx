'use client'

// Wrapper della mappa. Leaflet tocca l'oggetto window e si rompe in fase di
// server-side rendering, quindi carichiamo il contenuto vero (MappaInner) con
// dynamic import e ssr: false. Questo è permesso perché siamo già dentro un
// Client Component; non si potrebbe fare direttamente in un Server Component.

import dynamic from 'next/dynamic'

const MappaInner = dynamic(() => import('./MappaInner'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-64 rounded-2xl animate-pulse"
      style={{ background: 'var(--teal)', opacity: 0.08 }}
      aria-hidden
    />
  ),
})

interface MappaPosizioneProps {
  lat: number
  lng: number
  title: string
}

export default function MappaPosizione({ lat, lng, title }: MappaPosizioneProps) {
  // Se le coordinate non sono valide non proviamo nemmeno a montare la mappa.
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return (
      <div
        className="w-full h-64 rounded-2xl flex items-center justify-center text-sm"
        style={{ background: 'var(--teal)', opacity: 0.08, color: 'var(--teal)' }}
      >
        Posizione non disponibile
      </div>
    )
  }

  return <MappaInner lat={lat} lng={lng} title={title} />
}