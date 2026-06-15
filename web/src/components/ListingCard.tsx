import Link from 'next/link'
import { MapPin, Star, ShieldCheck } from 'lucide-react'
import type { Listing } from '@/lib/api'

const CATEGORY_COLORS: Record<string, string> = {
  utensili:     '#E0F2F1',
  sport:        '#FFF9C4',
  casa:         '#FBE9E7',
  elettronica:  '#EDE7F6',
  'tempo-libero': '#E8F5E9',
  trasporto:    '#E3F2FD',
}

const CATEGORY_TEXT: Record<string, string> = {
  utensili:     '#00796B',
  sport:        '#D4AE2A',
  casa:         '#D35400',
  elettronica:  '#5E35B1',
  'tempo-libero': '#2E7D32',
  trasporto:    '#1565C0',
}

interface Props {
  listing: Listing
  index?: number
}

export default function ListingCard({ listing, index = 0 }: Props) {
const slug = listing.category?.slug ?? ''
  const bgColor = CATEGORY_COLORS[slug] || '#F3F4F6'
  const textColor = CATEGORY_TEXT[slug] || '#374151'

  return (
    <Link href={`/oggetto/${listing.id}`}>
      <article
        className="listing-card bg-white rounded-2xl overflow-hidden border border-gray-100 opacity-0 animate-fade-up card-stagger cursor-pointer"
        style={{ animationDelay: `${index * 0.06}s` }}
      >
        {/* Immagine */}
        <div className="relative h-52 overflow-hidden" style={{ background: bgColor }}>
          {listing.cover_image ? (
            <img
              src={listing.cover_image}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl opacity-30">📦</span>
            </div>
          )}

          {/* Badge categoria */}
          <span
            className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: bgColor, color: textColor, border: `1px solid ${textColor}30` }}
          >
            {listing.category?.name}
          </span>
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="font-semibold text-base leading-snug mb-1 line-clamp-1" style={{ color: 'var(--ink)' }}>
            {listing.title}
          </h3>

          {/* Owner */}
          <div className="flex items-center gap-1.5 mb-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'var(--teal)' }}
            >
              {listing.owner?.name?.[0] || '?'}
            </div>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              {listing.owner?.name}
            </span>
            {listing.owner?.is_verified && (
              <ShieldCheck size={12} style={{ color: 'var(--teal)' }} />
            )}
            {listing.owner?.rating_avg != null && listing.owner.rating_avg > 0 && (
              <span className="text-xs ml-auto flex items-center gap-0.5" style={{ color: 'var(--muted)' }}>
                <Star size={11} fill="currentColor" style={{ color: 'var(--mustard-dark)' }} />
                {Number(listing.owner?.rating_avg).toFixed(1)}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted)' }}>
              <MapPin size={12} style={{ color: 'var(--terracotta)' }} />
              {listing.distance_km !== null
                ? `${listing.distance_km < 1
                    ? `${Math.round(listing.distance_km * 1000)}m`
                    : `${listing.distance_km.toFixed(1)}km`}`
                : listing.city}
            </div>
            <div className="text-right">
              <span className="font-bold text-base" style={{ color: 'var(--teal)' }}>
                €{Number(listing.price_per_day).toFixed(0)}
              </span>
              <span className="text-xs ml-0.5" style={{ color: 'var(--muted)' }}>/giorno</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
