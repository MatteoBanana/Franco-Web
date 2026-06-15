// Server Component — il fetch del dettaglio avviene sul server, stesso pattern
// usato nella home (page.tsx): fetch nativo con revalidate, niente axios qui.
// Axios resta riservato alle chiamate client (api.ts), i due approcci convivono.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, ShieldCheck, Star, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import type { ListingDetailResponse } from '@/lib/api'
import GalleriaImmagini from './GalleriaImmagini'
import MappaPosizione from './MappaPosizione'
import CalendarioDisponibilita from './CalendarioDisponibilita'
import FormPrenotazione from './FormPrenotazione'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://matteor80.sg-host.com/api'

// Il backend incrementa views_count a ogni show, quindi teniamo la cache breve:
// 30 secondi sono un buon compromesso tra freschezza e carico sul server.
async function fetchListing(id: string): Promise<ListingDetailResponse | null> {
  try {
    const res = await fetch(`${API_URL}/listings/${id}`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function OggettoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const payload = await fetchListing(id)

  // 404 sia per oggetto inesistente sia per oggetto non attivo (il backend
  // risponde con messaggio dedicato e status diverso da 200 in quel caso).
  if (!payload) notFound()

  const { listing, unavailable_dates: unavailableDates } = payload

  // I decimali Laravel arrivano serializzati come stringhe: conversione esplicita.
  const pricePerDay = Number(listing.price_per_day)
  const deposit = Number(listing.deposit)
  const lat = Number(listing.lat)
  const lng = Number(listing.lng)

  const ratingAvg = listing.owner?.rating_avg != null ? Number(listing.owner.rating_avg) : 0
  const categoryName = listing.category?.name ?? 'Oggetti'
  const categorySlug = listing.category?.slug ?? 'tutti'

  return (
    <div className="min-h-screen pb-24 lg:pb-0" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <nav aria-label="Percorso di navigazione" className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
          <Link href="/" className="hover:underline" style={{ color: 'var(--muted)' }}>
            Home
          </Link>
          <ChevronRight size={14} style={{ color: 'var(--muted)' }} />
          <Link
            href={`/?category=${categorySlug}`}
            className="hover:underline"
            style={{ color: 'var(--muted)' }}
          >
            {categoryName}
          </Link>
          <ChevronRight size={14} style={{ color: 'var(--muted)' }} />
          <span className="font-medium truncate max-w-[50%]" style={{ color: 'var(--ink)' }}>
            {listing.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Colonna sinistra: galleria, info, mappa, calendario ──────── */}
          <div className="lg:col-span-2 space-y-8">
            <GalleriaImmagini
              images={listing.images ?? []}
              coverImage={listing.cover_image}
              title={listing.title}
            />

            <header>
              <h1
                className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-3"
                style={{ color: 'var(--ink)' }}
              >
                {listing.title}
              </h1>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                <MapPin size={16} style={{ color: 'var(--terracotta)' }} />
                <span>{listing.city}</span>
                {listing.condition && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="capitalize">Condizione: {listing.condition}</span>
                  </>
                )}
              </div>
            </header>

            {listing.description && (
              <section>
                <h2 className="font-semibold text-lg mb-2" style={{ color: 'var(--ink)' }}>
                  Descrizione
                </h2>
                <p className="leading-relaxed whitespace-pre-line" style={{ color: 'var(--ink)' }}>
                  {listing.description}
                </p>
              </section>
            )}

            {/* ── Proprietario ────────────────────────────────────────────── */}
            {listing.owner && (
              <section className="rounded-2xl border border-gray-100 p-5 bg-white">
                <h2 className="font-semibold text-lg mb-4" style={{ color: 'var(--ink)' }}>
                  Proprietario
                </h2>
                <Link href={`/utente/${listing.owner.id}`} className="flex items-center gap-3 group">
                  {listing.owner.avatar_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={listing.owner.avatar_url}
                      alt={`Avatar di ${listing.owner.name}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ background: 'var(--teal)' }}
                      aria-hidden
                    >
                      {listing.owner.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium group-hover:underline" style={{ color: 'var(--ink)' }}>
                        {listing.owner.name}
                      </span>
                      {listing.owner.is_verified && (
                        <ShieldCheck size={15} style={{ color: 'var(--teal)' }} aria-label="Verificato" />
                      )}
                    </div>
                    {ratingAvg > 0 && (
                      <span className="flex items-center gap-0.5 text-sm" style={{ color: 'var(--muted)' }}>
                        <Star size={13} fill="currentColor" style={{ color: 'var(--mustard-dark, #C9A227)' }} />
                        {ratingAvg.toFixed(1)}
                      </span>
                    )}
                  </div>
                </Link>
              </section>
            )}

            {/* ── Mappa ───────────────────────────────────────────────────── */}
            <section>
              <h2 className="font-semibold text-lg mb-3" style={{ color: 'var(--ink)' }}>
                Posizione
              </h2>
              <MappaPosizione lat={lat} lng={lng} title={listing.title} />
              <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
                La posizione esatta viene condivisa dopo la conferma della prenotazione.
              </p>
            </section>

            {/* ── Calendario ──────────────────────────────────────────────── */}
            <section>
              <h2 className="font-semibold text-lg mb-3" style={{ color: 'var(--ink)' }}>
                Disponibilità
              </h2>
              <CalendarioDisponibilita unavailableDates={unavailableDates} />
            </section>
          </div>

          {/* ── Colonna destra: form prenotazione sticky su desktop ────────── */}
          <aside className="lg:col-span-1">
            <div id="prenota" className="lg:sticky lg:top-6">
              <FormPrenotazione
                pricePerDay={pricePerDay}
                deposit={deposit}
                unavailableDates={unavailableDates}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* ── CTA sticky solo mobile ─────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 inset-x-0 lg:hidden border-t border-gray-200 bg-white px-4 py-3 flex items-center justify-between gap-4 z-40"
        style={{ boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}
      >
        <div>
          <span className="font-bold text-lg" style={{ color: 'var(--teal)' }}>
            €{pricePerDay.toFixed(0)}
          </span>
          <span className="text-sm" style={{ color: 'var(--muted)' }}>
            /giorno
          </span>
        </div>
        <a
          href="#prenota"
          className="rounded-xl px-6 py-2.5 font-semibold text-sm"
          style={{ background: 'var(--mustard, #EAC435)', color: 'var(--ink)' }}
        >
          Prenota ora
        </a>
      </div>
    </div>
  )
}