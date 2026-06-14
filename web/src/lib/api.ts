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

export interface Owner {
  id: number
  name: string
  avatar_url: string | null
  rating_avg: number
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
  category: Category
  owner: Owner
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

export const getListing = (id: number) =>
  api.get(`/listings/${id}`).then(r => r.data)

export const getCategories = () =>
  api.get('/categories').then(r => r.data)

export const login = (email: string, password: string): Promise<AuthResponse> =>
  api.post('/auth/login', { email, password }).then(r => r.data)

export const register = (name: string, email: string, password: string): Promise<AuthResponse> =>
  api.post('/auth/register', { name, email, password, password_confirmation: password }).then(r => r.data)

export const getMe = (): Promise<MeResponse> =>
  api.get('/auth/me').then(r => r.data)

export const logout = (): Promise<{ message: string }> =>
  api.post('/auth/logout').then(r => r.data)

export const createBooking = (data: {
  listing_id: number
  date_from: string
  date_to: string
  renter_notes?: string
}) => api.post('/bookings', data).then(r => r.data)

export const getBookings = (role: 'renter' | 'owner' = 'renter') =>
  api.get('/bookings', { params: { role } }).then(r => r.data)

export default api