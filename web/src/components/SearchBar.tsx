'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ArrowRight, Loader2 } from 'lucide-react'

export default function SearchBar({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [locating, setLocating] = useState(false)

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
        // La geolocalizzazione lato client reindirizza alla pagina cerca
        // con le coordinate — la pagina /cerca gestisce la mappa
        router.push(`/cerca?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius=10`)
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  return (
    <div className="flex gap-3 flex-col sm:flex-row">
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
