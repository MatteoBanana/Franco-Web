import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://matteor80.sg-host.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Interceptor — aggiunge il token Bearer se presente
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('franco_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
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
  rating_avg: number | null
  is_verified: boolean
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

export const getCategories = () =>
  api.get('/categories').then(r => r.data)

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then(r => r.data)

export const register = (name: string, email: string, password: string) =>
  api.post('/auth/register', { name, email, password, password_confirmation: password }).then(r => r.data)

export const getMe = () =>
  api.get('/auth/me').then(r => r.data)

export const createBooking = (data: {
  listing_id: number
  date_from: string
  date_to: string
  renter_notes?: string
}) => api.post('/bookings', data).then(r => r.data)

export const getBookings = (role: 'renter' | 'owner' = 'renter') =>
  api.get('/bookings', { params: { role } }).then(r => r.data)

export default api
