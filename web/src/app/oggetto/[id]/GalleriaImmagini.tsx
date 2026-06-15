
'use client'

// Galleria immagini: immagine principale grande con sotto le miniature
// cliccabili. Lo switch è puro stato locale, perciò serve un Client Component.
// Se l'oggetto non ha immagini mostriamo un placeholder coerente con la palette.

import { useState } from 'react'
import { ImageOff } from 'lucide-react'

interface GalleriaImmaginiProps {
  images: { id: number; url: string }[]
  coverImage: string | null
  title: string
}

export default function GalleriaImmagini({ images, coverImage, title }: GalleriaImmaginiProps) {
  // Normalizziamo le fonti: se manca la galleria ripieghiamo sulla cover,
  // così la pagina resta sempre coerente anche con dati parziali.
  const sources: string[] =
    images.length > 0
      ? images.map((img) => img.url)
      : coverImage
        ? [coverImage]
        : []

  const [active, setActive] = useState(0)

  if (sources.length === 0) {
    return (
      <div
        className="aspect-[4/3] w-full rounded-2xl flex flex-col items-center justify-center gap-2"
        style={{ background: 'var(--teal)', opacity: 0.08 }}
        role="img"
        aria-label="Nessuna immagine disponibile per questo oggetto"
      >
        <ImageOff size={40} style={{ color: 'var(--teal)' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--teal)' }}>
          Nessuna foto disponibile
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sources[active]}
          alt={`${title} — immagine ${active + 1} di ${sources.length}`}
          className="w-full h-full object-cover"
        />
      </div>

      {sources.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sources.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Mostra immagine ${i + 1}`}
              aria-current={i === active}
              className="shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all focus:outline-none focus-visible:ring-2"
              style={{
                outline: i === active ? '3px solid var(--teal)' : '3px solid transparent',
                opacity: i === active ? 1 : 0.65,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}