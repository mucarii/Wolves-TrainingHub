import type { FormEvent } from 'react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      await login(email, password)
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível entrar. Verifique seus dados.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="gradient-background flex min-h-screen items-center justify-center px-4">
      <div className="glass-card w-full max-w-md rounded-[32px] border border-white/10 p-10 text-white">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-3xl">
            🐺
          </div>
          <h1 className="text-2xl font-semibold">Wolves Training Hub</h1>
          <p className="text-sm text-white/70">
            Sistema de gestão de treinos do time de futebol americano
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/90">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/90">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              required
            />
          </div>

          {errorMessage && (
            <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 w-full text-center text-sm font-medium text-white/70">
          Use o acesso do administrador configurado no backend.
        </p>
      </div>
    </div>
  )
}

export default LoginPage
