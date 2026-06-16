'use client'

// Card di una singola prenotazione. Due varianti:
//  - 'owner'  → richieste RICEVUTE: mostra chi richiede (renter) e, sulle pending,
//               i pulsanti conferma/rifiuta.
//  - 'renter' → prenotazioni INVIATE: mostra il proprietario (owner) dell'oggetto,
//               sola lettura, nessuna azione.

import { useState } from 'react'
import type { Booking } from '@/lib/api'

interface Props {
  booking: Booking
  variant: 'owner' | 'renter'
  onUpdate?: (id: number, status: 'confirmed' | 'rejected') => Promise<void>
}

const euro = (v: number) =>
  '€ ' + Number(v).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const dataIt = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })

const iniziali = (nome: string) =>
  (nome ?? '').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?'

const STATO: Record<Booking['status'], { label: string; bg: string; fg: string }> = {
  pending:   { label: 'In attesa',  bg: '#FBF3D5', fg: '#8A6D00' },
  confirmed: { label: 'Confermata', bg: '#DCEFEA', fg: 'var(--teal)' },
  active:    { label: 'In corso',   bg: '#DCEFEA', fg: 'var(--teal)' },
  completed: { label: 'Conclusa',   bg: '#ECECEC', fg: 'var(--muted)' },
  cancelled: { label: 'Annullata',  bg: '#F0EFEA', fg: 'var(--muted)' },
  rejected:  { label: 'Rifiutata',  bg: '#FDEDE7', fg: 'var(--terracotta)' },
}

export default function RichiestaCard({ booking, variant, onUpdate }: Props) {
  const [busy, setBusy] = useState(false)
  const [confermaRifiuto, setConfermaRifiuto] = useState(false)

  const stato = STATO[booking.status]
  const isOwner = variant === 'owner'
  const mostraAzioni = isOwner && booking.status === 'pending'

  // Persona da mostrare: il richiedente in owner, il proprietario in renter.
  const persona = isOwner ? booking.renter : booking.owner
  const sottotitolo = isOwner ? `su ${booking.listing?.title ?? 'un tuo oggetto'}` : 'La tua richiesta'

  // Il backend non manda price_per_day: lo ricaviamo dal subtotale diviso i giorni.
  const prezzoGiorno = booking.days > 0 ? booking.subtotal / booking.days : 0

  async function agisci(status: 'confirmed' | 'rejected') {
    if (!onUpdate) return
    setBusy(true)
    try {
      await onUpdate(booking.id, status)
    } finally {
      setBusy(false)
      setConfermaRifiuto(false)
    }
  }

  return (
    <li className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #F0EFEA' }}>
      {/* Riga alta: persona + badge stato */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: 'var(--teal)' }}
          >
            {persona?.avatar_url ? (
              <img src={persona.avatar_url} alt={persona.name} className="w-full h-full object-cover" />
            ) : (
              iniziali(persona?.name ?? '')
            )}
          </div>
          <div>
            <p className="font-medium leading-tight" style={{ color: 'var(--ink)' }}>
              {isOwner ? (persona?.name ?? 'Richiedente') : (booking.listing?.title ?? 'Oggetto')}
            </p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {isOwner ? sottotitolo : `da ${persona?.name ?? 'proprietario'}`}
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

      {/* Nota */}
      {booking.renter_notes && (
        <p className="mt-2 text-sm italic" style={{ color: 'var(--muted)' }}>
          “{booking.renter_notes}”
        </p>
      )}

      {/* Breakdown prezzo */}
      <div className="mt-4 pt-4 space-y-1.5 text-sm" style={{ borderTop: '1px solid #F0EFEA' }}>
        <div className="flex justify-between" style={{ color: 'var(--muted)' }}>
          <span>{euro(prezzoGiorno)} × {booking.days} {booking.days === 1 ? 'giorno' : 'giorni'}</span>
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

      {/* Azioni — solo owner, solo pending */}
      {mostraAzioni && (
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
            <div className="rounded-xl p-3" style={{ background: '#FDEDE7' }}>
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