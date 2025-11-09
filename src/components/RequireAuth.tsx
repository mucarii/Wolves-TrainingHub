import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

const RequireAuth = ({ children }: Props) => {
  const { user, isAuthenticating } = useAuth()
  const location = useLocation()

  if (isAuthenticating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050912] text-wolves-muted">
        Validando sessão...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default RequireAuth
