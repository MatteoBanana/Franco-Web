'use client'

// Bottone "Modifica" mostrato solo al proprietario dell'oggetto.
// La pagina /oggetto/[id] è Server Component e non conosce l'utente loggato;
// questo mini Client Component riceve l'ownerId, legge l'utente via useAuth e
// mostra il bottone solo se coincidono.

import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface Props {
  listingId: number
  ownerId: number
}

export default function BottoneModifica({ listingId, ownerId }: Props) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user || user.id !== ownerId) return null

  return (
    <Link
      href={`/oggetto/${listingId}/modifica`}
      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
      style={{ background: 'var(--teal-light)', color: 'var(--teal)' }}
    >
      <Pencil size={15} />
      Modifica oggetto
    </Link>
  )
}