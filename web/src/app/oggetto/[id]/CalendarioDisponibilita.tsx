'use client'

// Calendario disponibilità in sola lettura. Riceve gli intervalli non disponibili
// nel formato del backend ({ from, to }) e li espande nel set dei singoli giorni
// occupati. Mostra un mese alla volta con navigazione avanti/indietro; i giorni
// passati sono attenuati, quelli occupati evidenziati in terracotta. Nessuna
// selezione qui: la scelta delle date avviene nel form di prenotazione.

import { useMemo, useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isBefore,
  isToday,
  addMonths,
  subMonths,
  parseISO,
  startOfDay,
} from 'date-fns'
import { it } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarioDisponibilitaProps {
  unavailableDates: { from: string; to: string }[]
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

export default function CalendarioDisponibilita({ unavailableDates }: CalendarioDisponibilitaProps) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))

  // Espandiamo ogni intervallo nei suoi giorni e li mettiamo in un Set di
  // stringhe yyyy-MM-dd per un confronto O(1) durante il render della griglia.
  const occupiedSet = useMemo(() => {
    const set = new Set<string>()
    for (const range of unavailableDates) {
      try {
        const days = eachDayOfInterval({ start: parseISO(range.from), end: parseISO(range.to) })
        for (const d of days) set.add(format(d, 'yyyy-MM-dd'))
      } catch {
        // intervallo malformato: lo ignoriamo senza far cadere il componente
      }
    }
    return set
  }, [unavailableDates])

  // La griglia parte dal lunedì della prima settimana e arriva alla domenica
  // dell'ultima, così le celle restano allineate a una settimana lunedì→domenica.
  const grid = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
    const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [cursor])

  const today = startOfDay(new Date())

  return (
    <div className="rounded-2xl border border-gray-100 p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCursor((c) => subMonths(c, 1))}
          aria-label="Mese precedente"
          className="p-1.5 rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring-2"
          style={{ color: 'var(--ink)' }}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-semibold capitalize" style={{ color: 'var(--ink)' }}>
          {format(cursor, 'MMMM yyyy', { locale: it })}
        </span>
        <button
          type="button"
          onClick={() => setCursor((c) => addMonths(c, 1))}
          aria-label="Mese successivo"
          className="p-1.5 rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring-2"
          style={{ color: 'var(--ink)' }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1" style={{ color: 'var(--muted)' }}>
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const inMonth = isSameMonth(day, cursor)
          const past = isBefore(day, today)
          const occupied = occupiedSet.has(key)

          let bg = 'transparent'
          let color = 'var(--ink)'
          if (!inMonth || past) color = 'var(--muted)'
          if (occupied) {
            bg = 'var(--terracotta)'
            color = '#fff'
          }

          return (
            <div
              key={key}
              className="aspect-square flex items-center justify-center text-sm rounded-lg"
              style={{
                background: bg,
                color,
                opacity: !inMonth ? 0.35 : 1,
                outline: isToday(day) && !occupied ? '2px solid var(--teal)' : 'none',
                outlineOffset: '-2px',
                textDecoration: past && !occupied ? 'line-through' : 'none',
              }}
              aria-label={
                occupied
                  ? `${format(day, 'd MMMM', { locale: it })}: non disponibile`
                  : format(day, 'd MMMM', { locale: it })
              }
            >
              {format(day, 'd')}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: 'var(--muted)' }}>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: 'var(--terracotta)' }} />
          Non disponibile
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ outline: '2px solid var(--teal)', outlineOffset: '-2px' }} />
          Oggi
        </span>
      </div>
    </div>
  )
}