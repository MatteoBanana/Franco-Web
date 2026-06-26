import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://matteor80.sg-host.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// ── Token helpers ─────────────────────────────────────────────────────────────
// Centralizziamo qui la chiave di localStorage, così nessun altro file deve
// conoscere la stringa "franco_token": passa tutto da queste funzioni.

export const TOKEN_KEY = 'franco_token'

export const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token)
}

export const clearToken = (): void => {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY)
}

// Interceptor — aggiunge il token Bearer se presente
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Tipi ─────────────────────────────────────────────────────────────────────

export interface Category {
  id: number
  name: string
  slug: string
  icon: string
}

export interface CategoriesResponse {
  data: Category[]
}

export interface Owner {
  id: number
  name: string
  avatar_url: string | null
  rating_avg: number | null
  is_verified: boolean
}

export interface User {
  id: number
  name: string
  email: string
  avatar_url: string | null
  is_verified: boolean
  rating_avg: number | null
  city?: string | null
  bio?: string | null
}

export interface AuthResponse {
  user: User
  token: string
}

export interface MeResponse {
  user: User
}

export interface Listing {
  id: number
  title: string
  price_per_day: number
  deposit: number
  condition: string
  city: string
  lat: number
  lng: number
  status: string
  cover_image: string | null
  distance_km: number | null
  category: Category | null
  owner: Owner | null
  description?: string
  address?: string
  images?: { id: number; url: string }[]
}

export interface ListingsResponse {
  data: Listing[]
  meta: {
    total: number
    current_page: number
    last_page: number
    per_page: number
  }
}

export interface ListingDetailResponse {
  listing: Listing
  unavailable_dates: { from: string; to: string }[]
}

// Stati prenotazione — specchiano l'enum della tabella bookings lato backend.
// La macchina a stati permette pending → confirmed | rejected (azioni del proprietario).
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'rejected'

// Forma CONFERMATA sul JSON reale di GET /bookings (BookingController).
// Note importanti emerse dal dato vero, diverse dalla prima ipotesi:
//  - i campi monetari arrivano come NUMBER, non come string;
//  - non esiste price_per_day sul booking (se serve, si ricava da subtotal / days);
//  - listing porta city (non cover_image), e il booking include sia renter sia owner.
export interface BookingListingRef {
  id: number
  title: string
  city?: string
  cover_image?: string | null
}

export interface BookingPersonRef {
  id: number
  name: string
  avatar_url?: string | null
}

export interface Booking {
  id: number
  status: BookingStatus
  date_from: string
  date_to: string
  days: number
  subtotal: number
  deposit: number
  total: number
  confirmed_at?: string | null
  renter_notes?: string | null
  owner_notes?: string | null
  created_at?: string
  listing: BookingListingRef
  renter: BookingPersonRef
  owner: BookingPersonRef
}

export interface BookingsResponse {
  data: Booking[]
  meta?: {
    total: number
  }
}

export interface ListingParams {
  lat?: number
  lng?: number
  radius?: number
  category?: string
  q?: string
  min_price?: number
  max_price?: number
  date_from?: string
  date_to?: string
  per_page?: number
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const getListings = (params: ListingParams = {}): Promise<ListingsResponse> =>
  api.get('/listings', { params }).then(r => r.data)

export const getListing = (id: number): Promise<ListingDetailResponse> =>
  api.get(`/listings/${id}`).then(r => r.data)

export const getCategories = (): Promise<CategoriesResponse> =>
  api.get('/categories').then(r => r.data)

export const login = (email: string, password: string): Promise<AuthResponse> =>
  api.post('/auth/login', { email, password }).then(r => r.data)

export const register = (name: string, email: string, password: string): Promise<AuthResponse> =>
  api.post('/auth/register', { name, email, password, password_confirmation: password }).then(r => r.data)

export const getMe = (): Promise<MeResponse> =>
  api.get('/auth/me').then(r => r.data)

export const updateProfile = (
  data: Partial<{ name: string; city: string | null; bio: string | null }>
): Promise<MeResponse> =>
  api.patch('/auth/me', data).then(r => r.data)

export const logout = (): Promise<{ message: string }> =>
  api.post('/auth/logout').then(r => r.data)

export const createBooking = (data: {
  listing_id: number
  date_from: string
  date_to: string
  renter_notes?: string
}) => api.post('/bookings', data).then(r => r.data)

export const getBookings = (role: 'renter' | 'owner' = 'renter'): Promise<BookingsResponse> =>
  api.get('/bookings', { params: { role } }).then(r => r.data)

// Cambio stato prenotazione — PATCH /bookings/{id}/status.
export const updateBookingStatus = (id: number, status: BookingStatus): Promise<{ booking: Booking }> =>
  api.patch(`/bookings/${id}/status`, { status }).then(r => r.data)

// Crea un nuovo annuncio — POST /listings. L'oggetto nasce 'draft' lato backend.
export const createListing = (data: {
  category_id: number
  title: string
  description: string
  price_per_day: number
  deposit?: number
  condition: 'new' | 'excellent' | 'good' | 'fair'
  lat: number
  lng: number
  address: string
  city: string
}): Promise<{ listing: Listing }> =>
  api.post('/listings', data).then(r => r.data)

// Modifica un annuncio esistente — PATCH /listings/{id}. Usata anche per
// l'attivazione (status: 'active') subito dopo la pubblicazione.
export const updateListing = (
  id: number,
  data: Partial<{
    title: string
    description: string
    price_per_day: number
    deposit: number
    condition: 'new' | 'excellent' | 'good' | 'fair'
    lat: number
    lng: number
    address: string
    city: string
    status: 'draft' | 'active' | 'paused'
  }>
): Promise<{ listing: Listing }> =>
  api.patch(`/listings/${id}`, data).then(r => r.data)

export default api