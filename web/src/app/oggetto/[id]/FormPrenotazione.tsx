'use client'

// Form di prenotazione. Il submit ora crea la prenotazione reale tramite
// createBooking (POST /bookings, protetto da Sanctum). Se l'utente non è
// autenticato lo mandiamo al login conservando la pagina di ritorno in
// ?redirect, così dopo l'accesso torna esattamente qui. A prenotazione
// creata la richiesta nasce in stato "pending" lato backend: lo comunichiamo
// in modo esplicito sostituendo il form con una conferma, senza promettere
// all'utente una conferma che spetta al proprietario.

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isBefore,
  parseISO,
} from 'date-fns'
import { useAuth } from '@/lib/auth-context'
import { createBooking } from '@/lib/api'

interface FormPrenotazioneProps {
  listingId: number
  pricePerDay: number
  deposit: number
  unavailableDates: { from: string; to: string }[]
}

const eur = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })

// Estrae il messaggio di errore dalla risposta del backend senza dover
// importare axios qui: in caso di 422 (es. date non disponibili) o di altri
// errori applicativi il backend popola response.data.message. Se non c'è
// nulla di leggibile usiamo un messaggio generico.
function extractErrorMessage(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const response = (e as { response?: { data?: { message?: unknown } } }).response
    const message = response?.data?.message
    if (typeof message === 'string' && message.trim() !== '') return message
  }
  return 'Non siamo riusciti a completare la prenotazione. Riprova tra poco.'
}

export default function FormPrenotazione({
  listingId,
  pricePerDay,
  deposit,
  unavailableDates,
}: FormPrenotazioneProps) {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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

  const canSubmit = breakdown != null && !('error' in breakdown) && !submitting

  async function handleSubmit() {
    if (!canSubmit) return

    // Il bootstrap dell'auth dura pochi millisecondi al primo mount: se per
    // qualche ragione il click arriva prima che sia concluso, evitiamo di
    // mandare al login un utente che potrebbe in realtà essere autenticato.
    if (authLoading) return

    // A1 — utente non loggato: redirect al login conservando il ritorno.
    if (!isAuthenticated) {
      const here = typeof window !== 'undefined' ? window.location.pathname : '/'
      router.push(`/login?redirect=${encodeURIComponent(here)}`)
      return
    }

    setSubmitting(true)
    setErrorMsg(null)
    try {
      await createBooking({
        listing_id: listingId,
        date_from: dateFrom,
        date_to: dateTo,
      })
      setSuccess(true)
    } catch (e) {
      setErrorMsg(extractErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
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

      {/* ── Conferma (B1) ────────────────────────────────────────────────── */}
      {/* A prenotazione creata sostituiamo l'intero form con la conferma: lo
          stato reale lato backend è "pending", quindi parliamo di richiesta
          inviata in attesa del proprietario, non di prenotazione confermata. */}
      {success ? (
        <div
          role="status"
          className="rounded-xl px-4 py-4 text-sm"
          style={{ background: 'var(--teal)', color: '#fff' }}
        >
          <p className="font-semibold mb-1">Richiesta inviata!</p>
          <p className="opacity-90">
            La tua richiesta di prenotazione è stata inviata al proprietario. Riceverai una
            notifica appena verrà confermata.
          </p>
        </div>
      ) : (
        <>
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

          {/* ── Riepilogo prezzo ─────────────────────────────────────────── */}
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

          {/* Errore dal backend (es. date non disponibili, conflitto). */}
          {errorMsg && (
            <p className="mt-3 text-sm" style={{ color: 'var(--terracotta)' }}>
              {errorMsg}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="mt-4 w-full rounded-xl py-3 font-semibold text-sm transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--mustard, #EAC435)', color: 'var(--ink)' }}
          >
            {submitting ? 'Invio…' : 'Prenota ora'}
          </button>
        </>
      )}
    </div>
  )
}