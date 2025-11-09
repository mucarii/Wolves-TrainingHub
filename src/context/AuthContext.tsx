import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authService } from '../services/authService'
import { setAuthToken } from '../services/apiClient'

type AuthUser = {
  id: number
  name: string
  email: string
}

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticating: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = import.meta.env.VITE_AUTH_STORAGE_KEY ?? 'wolves-traininghub-auth'

type StoredAuth = {
  token: string
  user: AuthUser
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredAuth
        setUser(parsed.user)
        setToken(parsed.token)
        setAuthToken(parsed.token)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setIsAuthenticating(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await authService.login(email, password)
    setUser(data.user)
    setToken(data.token)
    setAuthToken(data.token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: data.token, user: data.user }))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setAuthToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isAuthenticating,
    }),
    [user, token, login, logout, isAuthenticating],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
