'use client'

// Form di prenotazione. Per ora il submit non crea nulla: mostra solo un toast
// "in arrivo", perché la prenotazione vera richiede l'auth Sanctum che arriverà
// nella feature successiva. Qui calcoliamo già il prezzo totale in tempo reale e
// validiamo le date contro gli intervalli non disponibili, così quando colleghermo
// createBooking il pezzo difficile sarà già pronto.

import { useMemo, useState } from 'react'
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isBefore,
  parseISO,
  startOfDay,
} from 'date-fns'

interface FormPrenotazioneProps {
  pricePerDay: number
  deposit: number
  unavailableDates: { from: string; to: string }[]
}

const eur = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })

export default function FormPrenotazione({ pricePerDay, deposit, unavailableDates }: FormPrenotazioneProps) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [toast, setToast] = useState(false)

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  // Set dei giorni occupati, identico alla logica del calendario: lo usiamo per
  // segnalare subito se l'intervallo scelto tocca date già prenotate.
  const occupiedSet = useMemo(() => {
    const set = new Set<string>()
    for (const range of unavailableDates) {
      try {
        const days = eachDayOfInterval({ start: parseISO(range.from), end: parseISO(range.to) })
        for (const d of days) set.add(format(d, 'yyyy-MM-dd'))
      } catch {
        /* intervallo malformato ignorato */
      }
    }
    return set
  }, [unavailableDates])

  // Calcolo prezzo. I giorni di noleggio includono sia il primo che l'ultimo
  // giorno, quindi differenceInCalendarDays + 1 (un noleggio dal 3 al 3 dura
  // un giorno, dal 3 al 5 ne dura tre).
  const breakdown = useMemo(() => {
    if (!dateFrom || !dateTo) return null
    const from = parseISO(dateFrom)
    const to = parseISO(dateTo)
    if (isBefore(to, from)) return { error: 'La data di fine deve essere uguale o successiva a quella di inizio.' }

    const overlap = eachDayOfInterval({ start: from, end: to }).some((d) =>
      occupiedSet.has(format(d, 'yyyy-MM-dd')),
    )
    if (overlap) return { error: 'Alcune date selezionate non sono disponibili.' }

    const days = differenceInCalendarDays(to, from) + 1
    const subtotal = days * pricePerDay
    const total = subtotal + deposit
    return { days, subtotal, total }
  }, [dateFrom, dateTo, pricePerDay, deposit, occupiedSet])

  const canSubmit = breakdown != null && !('error' in breakdown)

  function handleSubmit() {
    if (!canSubmit) return
    setToast(true)
    window.setTimeout(() => setToast(false), 3500)
  }

  return (
    <div className="rounded-2xl border border-gray-100 p-5 bg-white">
      <div className="flex items-baseline gap-1 mb-4">
        <span className="font-bold text-2xl" style={{ color: 'var(--teal)' }}>
          {eur.format(pricePerDay)}
        </span>
        <span className="text-sm" style={{ color: 'var(--muted)' }}>
          / giorno
        </span>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
            Data inizio
          </span>
          <input
            type="date"
            value={dateFrom}
            min={todayStr}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="Data di inizio noleggio"
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2"
            style={{ color: 'var(--ink)' }}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
            Data fine
          </span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || todayStr}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="Data di fine noleggio"
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2"
            style={{ color: 'var(--ink)' }}
          />
        </label>
      </div>

      {/* ── Riepilogo prezzo ─────────────────────────────────────────────── */}
      {breakdown && 'error' in breakdown && (
        <p className="mt-3 text-sm" style={{ color: 'var(--terracotta)' }}>
          {breakdown.error}
        </p>
      )}

      {breakdown && !('error' in breakdown) && (
        <div className="mt-4 space-y-1.5 text-sm" style={{ color: 'var(--ink)' }}>
          <div className="flex justify-between">
            <span>
              {eur.format(pricePerDay)} × {breakdown.days}{' '}
              {breakdown.days === 1 ? 'giorno' : 'giorni'}
            </span>
            <span>{eur.format(breakdown.subtotal)}</span>
          </div>
          {deposit > 0 && (
            <div className="flex justify-between" style={{ color: 'var(--muted)' }}>
              <span>Cauzione (rimborsabile)</span>
              <span>{eur.format(deposit)}</span>
            </div>
          )}
          <div
            className="flex justify-between font-semibold pt-2 mt-1 border-t border-gray-100 text-base"
            style={{ color: 'var(--ink)' }}
          >
            <span>Totale</span>
            <span>{eur.format(breakdown.total)}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="mt-4 w-full rounded-xl py-3 font-semibold text-sm transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'var(--mustard, #EAC435)', color: 'var(--ink)' }}
      >
        Prenota ora
      </button>

      {toast && (
        <div
          role="status"
          className="mt-3 rounded-xl px-4 py-3 text-sm text-center"
          style={{ background: 'var(--teal)', color: '#fff' }}
        >
          Funzionalità prenotazione in arrivo
        </div>
      )}
    </div>
  )
}