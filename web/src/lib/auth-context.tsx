'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getMe,
  getToken,
  setToken,
  clearToken,
  type User,
} from '@/lib/api'

interface AuthContextValue {
  user: User | null
  loading: boolean // true durante il bootstrap iniziale, poi sempre false
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Al primo mount, se in localStorage c'è un token lo validiamo chiamando
  // /auth/me. In questo modo la sessione sopravvive al refresh, ma un token
  // scaduto o revocato viene ripulito subito invece di lasciare uno stato
  // di autenticazione fantasma che fallirebbe alla prima azione protetta.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    getMe()
      .then(({ user }) => setUser(user))
      .catch(() => {
        clearToken()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await apiLogin(email, password)
    setToken(token)
    setUser(user)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { user, token } = await apiRegister(name, email, password)
    setToken(token)
    setUser(user)
  }, [])

  // Tentiamo di revocare il token lato server, ma ripuliamo lo stato locale in
  // ogni caso: un errore di rete non deve lasciare l'utente intrappolato in una
  // sessione che non riesce più a chiudere.
  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // token già invalido o server irraggiungibile: procediamo comunque
    }
    clearToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve essere usato dentro <AuthProvider>')
  return ctx
}

// Guardia per le azioni e le pagine protette. Se il bootstrap è concluso e
// l'utente non è autenticato, reindirizza al login conservando la pagina di
// partenza in ?redirect, così dopo l'accesso torna esattamente dove voleva.
export function useRequireAuth(redirectTo = '/login') {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading || isAuthenticated) return
    const here = typeof window !== 'undefined' ? window.location.pathname : '/'
    router.replace(`${redirectTo}?redirect=${encodeURIComponent(here)}`)
  }, [loading, isAuthenticated, redirectTo, router])

  return { isAuthenticated, loading }
}