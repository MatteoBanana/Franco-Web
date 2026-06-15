'use client'

// Card di una singola richiesta di prenotazione, lato proprietario.
// Mostra chi richiede, su quale oggetto, le date, il breakdown del prezzo e —
// solo per le richieste in stato 'pending' — i pulsanti per confermare o rifiutare.
// La conferma è diretta; il rifiuto chiede un secondo click di sicurezza, così il
// proprietario non brucia una richiesta per sbaglio (scelta concordata, opzione B).

import { useState } from 'react'
import type { Booking } from '@/lib/api'

interface Props {
  booking: Booking
  // Eseguita dal genitore: applica l'update ottimistico e chiama l'API.
  onUpdate: (id: number, status: 'confirmed' | 'rejected') => Promise<void>
}

// Formattatore euro italiano riusato per ogni importo della card.
const euro = (v: string | number) =>
  '€ ' + Number(v).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Date in formato leggibile italiano (es. "1 lug 2026").
const dataIt = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })

// Iniziali per l'avatar quando manca avatar_url, stesso criterio della Navbar.
const iniziali = (nome: string) =>
  (nome ?? '').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?'

// Etichetta e colore per ogni stato, così il badge è coerente in tutta la lista.
const STATO: Record<Booking['status'], { label: string; bg: string; fg: string }> = {
  pending:   { label: 'In attesa',  bg: '#FBF3D5', fg: '#8A6D00' },
  confirmed: { label: 'Confermata', bg: '#DCEFEA', fg: 'var(--teal)' },
  active:    { label: 'In corso',   bg: '#DCEFEA', fg: 'var(--teal)' },
  completed: { label: 'Conclusa',   bg: '#ECECEC', fg: 'var(--muted)' },
  cancelled: { label: 'Annullata',  bg: '#F0EFEA', fg: 'var(--muted)' },
  rejected:  { label: 'Rifiutata',  bg: '#FDEDE7', fg: 'var(--terracotta)' },
}

export default function RichiestaCard({ booking, onUpdate }: Props) {
  // 'busy' blocca i pulsanti durante la chiamata; 'confermaRifiuto' apre lo step
  // di sicurezza prima del rifiuto vero.
  const [busy, setBusy] = useState(false)
  const [confermaRifiuto, setConfermaRifiuto] = useState(false)

  const stato = STATO[booking.status]
  const isPending = booking.status === 'pending'

  async function agisci(status: 'confirmed' | 'rejected') {
    setBusy(true)
    try {
      await onUpdate(booking.id, status)
    } finally {
      setBusy(false)
      setConfermaRifiuto(false)
    }
  }

  return (
    <li
      className="rounded-2xl p-5"
      style={{ background: 'white', border: '1px solid #F0EFEA' }}
    >
      {/* Riga alta: richiedente + badge stato */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: 'var(--teal)' }}
          >
            {booking.renter?.avatar_url ? (
              <img src={booking.renter.avatar_url} alt={booking.renter.name} className="w-full h-full object-cover" />
            ) : (
              iniziali(booking.renter?.name ?? '')
            )}
          </div>
          <div>
            <p className="font-medium leading-tight" style={{ color: 'var(--ink)' }}>
              {booking.renter?.name ?? 'Richiedente'}
            </p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              su {booking.listing?.title ?? 'un tuo oggetto'}
            </p>
          </div>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
          style={{ background: stato.bg, color: stato.fg }}
        >
          {stato.label}
        </span>
      </div>

      {/* Date */}
      <p className="mt-4 text-sm" style={{ color: 'var(--ink)' }}>
        {dataIt(booking.date_from)} → {dataIt(booking.date_to)}
        <span style={{ color: 'var(--muted)' }}> · {booking.days} {booking.days === 1 ? 'giorno' : 'giorni'}</span>
      </p>

      {/* Eventuale nota del richiedente */}
      {booking.renter_notes && (
        <p className="mt-2 text-sm italic" style={{ color: 'var(--muted)' }}>
          “{booking.renter_notes}”
        </p>
      )}

      {/* Breakdown prezzo */}
      <div className="mt-4 pt-4 space-y-1.5 text-sm" style={{ borderTop: '1px solid #F0EFEA' }}>
        <div className="flex justify-between" style={{ color: 'var(--muted)' }}>
          <span>{euro(booking.price_per_day)} × {booking.days} {booking.days === 1 ? 'giorno' : 'giorni'}</span>
          <span>{euro(booking.subtotal)}</span>
        </div>
        {Number(booking.deposit) > 0 && (
          <div className="flex justify-between" style={{ color: 'var(--muted)' }}>
            <span>Cauzione</span>
            <span>{euro(booking.deposit)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold pt-1" style={{ color: 'var(--ink)' }}>
          <span>Totale</span>
          <span>{euro(booking.total)}</span>
        </div>
      </div>

      {/* Azioni — solo per le richieste in attesa */}
      {isPending && (
        <div className="mt-5">
          {!confermaRifiuto ? (
            <div className="flex gap-3">
              <button
                onClick={() => agisci('confirmed')}
                disabled={busy}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ background: 'var(--teal)', color: 'white' }}
              >
                {busy ? 'Attendi…' : 'Conferma'}
              </button>
              <button
                onClick={() => setConfermaRifiuto(true)}
                disabled={busy}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                style={{ background: 'transparent', color: 'var(--terracotta)', border: '1px solid var(--terracotta)' }}
              >
                Rifiuta
              </button>
            </div>
          ) : (
            <div
              className="rounded-xl p-3"
              style={{ background: '#FDEDE7' }}
            >
              <p className="text-sm mb-3" style={{ color: 'var(--terracotta)' }}>
                Rifiutare questa richiesta? L’azione non si annulla.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => agisci('rejected')}
                  disabled={busy}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50"
                  style={{ background: 'var(--terracotta)', color: 'white' }}
                >
                  {busy ? 'Attendi…' : 'Sì, rifiuta'}
                </button>
                <button
                  onClick={() => setConfermaRifiuto(false)}
                  disabled={busy}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  style={{ background: 'white', color: 'var(--muted)' }}
                >
                  Annulla
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  )
}