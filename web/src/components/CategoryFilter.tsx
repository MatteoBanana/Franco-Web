'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Globe, Monitor, Wrench, Bike, Home, Car, Smile } from 'lucide-react'

// Categorie allineate a quelle realmente presenti nel database (GET /categories):
// Casa, Elettronica, Sport, Tempo libero, Trasporto, Utensili. Gli slug devono
// combaciare con quelli del backend, altrimenti il filtro non trova nulla.
const CATEGORIES = [
  { slug: 'tutti',        label: 'Tutti',        icon: Globe },
  { slug: 'casa',         label: 'Casa',         icon: Home },
  { slug: 'elettronica',  label: 'Elettronica',  icon: Monitor },
  { slug: 'sport',        label: 'Sport',        icon: Bike },
  { slug: 'tempo-libero', label: 'Tempo libero', icon: Smile },
  { slug: 'trasporto',    label: 'Trasporto',    icon: Car },
  { slug: 'utensili',     label: 'Utensili',     icon: Wrench },
]

interface Props {
  active: string
}

export default function CategoryFilter({ active }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleClick = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug === 'tutti') {
      params.delete('category')
    } else {
      params.set('category', slug)
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {CATEGORIES.map(({ slug, label, icon: Icon }) => {
        const isActive = active === slug
        return (
          <button
            key={slug}
            onClick={() => handleClick(slug)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border flex-shrink-0"
            style={isActive
              ? { background: 'var(--teal)', borderColor: 'var(--teal)', color: 'white' }
              : { background: 'white', borderColor: '#E5E7EB', color: 'var(--muted)' }
            }
          >
            <Icon size={14} />
            {label}
          </button>
        )
      })}
    </div>
  )
}