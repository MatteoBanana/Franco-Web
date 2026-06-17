'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ArrowRight, Loader2 } from 'lucide-react'

export default function SearchBar({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [locating, setLocating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Se si arriva con l'hash #cerca (dal link "Cerca" in Navbar), scrolliamo fino
  // alla barra dopo il mount. Gestito qui — e non con un'ancora HTML pura —
  // perché così funziona anche arrivando da un'altra pagina: lo scroll scatta
  // quando il componente è montato, non dipende dal timing della navigazione.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#cerca') {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    router.push(`/?${params.toString()}`)
  }

  const locateMe = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        router.push(`/?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius=10`)
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  return (
    <div ref={containerRef} id="cerca" className="flex gap-3 flex-col sm:flex-row scroll-mt-24">
      <div className="flex-1 flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
        <Search size={18} style={{ color: 'var(--muted)' }} />
        <input
          type="text"
          placeholder="Cosa stai cercando?"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="flex-1 outline-none text-sm bg-transparent"
          style={{ color: 'var(--ink)' }}
        />
        <button
          onClick={locateMe}
          className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors"
          style={{ color: locating ? 'var(--teal)' : 'var(--muted)' }}
          title="Cerca vicino a me"
        >
          {locating
            ? <Loader2 size={14} className="animate-spin" />
            : <MapPin size={14} />}
          Vicino a me
        </button>
      </div>
      <button
        onClick={handleSearch}
        className="px-6 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
        style={{ background: 'var(--mustard)', color: 'var(--ink)' }}
      >
        Cerca <ArrowRight size={16} />
      </button>
    </div>
  )
}