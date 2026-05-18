// Server Component — il fetch avviene sul server, la pagina arriva già con i dati
import { Search, MapPin, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ListingCard from '@/components/ListingCard'
import CategoryFilter from '@/components/CategoryFilter'
import SearchBar from '@/components/SearchBar'
import type { Listing } from '@/lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://matteor80.sg-host.com/api'

interface SearchParams {
  q?: string
  category?: string
  lat?: string
  lng?: string
  radius?: string
}

async function fetchListings(params: SearchParams = {}): Promise<{ data: Listing[]; meta: { total: number } }> {
  const url = new URL(`${API_URL}/listings`)
  if (params.q) url.searchParams.set('q', params.q)
  if (params.category && params.category !== 'tutti') url.searchParams.set('category', params.category)
  if (params.lat && params.lng) {
    url.searchParams.set('lat', params.lat)
    url.searchParams.set('lng', params.lng)
    url.searchParams.set('radius', params.radius || '10')
  }
  url.searchParams.set('per_page', '12')

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 }, // cache 60 secondi, poi refetch automatico
    })
    if (!res.ok) throw new Error('API error')
    return res.json()
  } catch {
    return { data: [], meta: { total: 0 } }
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { data: listings, meta } = await fetchListings(params)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: 'var(--teal)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 border-2 border-white" />
          <div className="absolute top-8 -right-8 w-40 h-40 rounded-full opacity-10 border-2 border-white" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-5 bg-white" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3 opacity-70 text-white">
              Noleggio tra privati
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
              Condividi nel<br />tuo quartiere
            </h1>
            <p className="text-white opacity-75 text-lg mb-8 leading-relaxed">
              Presta e prendi in prestito oggetti dai tuoi vicini.<br />
              Economia circolare, a km zero.
            </p>

            {/* SearchBar è client component per interattività */}
            <SearchBar initialQuery={params.q || ''} />

            <div className="mt-5">
              <a
                href="/pubblica"
                className="inline-flex items-center gap-2 text-white text-sm opacity-80 hover:opacity-100 transition-opacity border border-white/30 rounded-xl px-4 py-2"
              >
                Pubblica un oggetto <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENUTO PRINCIPALE ─────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center gap-2 mb-4">
          <MapPin size={16} style={{ color: 'var(--terracotta)' }} />
          <h2 className="font-semibold text-base" style={{ color: 'var(--ink)' }}>
            {params.lat && params.lng ? 'Oggetti vicino a te' : 'Oggetti disponibili'}
          </h2>
          <span className="text-sm ml-auto" style={{ color: 'var(--muted)' }}>
            {meta.total} {meta.total === 1 ? 'oggetto' : 'oggetti'}
          </span>
        </div>

        {/* Filtri — client component per navigazione URL */}
        <div className="mb-6">
          <CategoryFilter active={params.category || 'tutti'} />
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-semibold text-lg mb-2" style={{ color: 'var(--ink)' }}>
              Nessun oggetto trovato
            </p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Prova a modificare i filtri o a cercare qualcosa di diverso
            </p>
            <a href="/" className="mt-4 inline-block text-sm underline" style={{ color: 'var(--teal)' }}>
              Vedi tutti gli oggetti
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display font-bold" style={{ color: 'var(--teal)' }}>
            franco<span style={{ color: 'var(--terracotta)' }}>.</span>
          </span>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Economia circolare, a km zero. © 2026
          </p>
        </div>
      </footer>
    </div>
  )
}
