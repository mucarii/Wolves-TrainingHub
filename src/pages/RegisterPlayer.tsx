import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { playerService } from '../services/playerService'
import type { PlayerPosition, PlayerShortPosition } from '../types/player'

const RegisterPlayerPage = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const mapPositionToShort = (position: PlayerPosition): PlayerShortPosition => {
    switch (position) {
      case 'Ataque':
        return 'atk'
      case 'Defesa':
        return 'def'
    }
    return 'esp'
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const position = (formData.get('position') as PlayerPosition | null) ?? 'Ataque'

    const payload = {
      name: (formData.get('name') as string) ?? '',
      email: (formData.get('email') as string) ?? '',
      phone: (formData.get('phone') as string) || null,
      position,
      shortPosition: mapPositionToShort(position),
      status: 'Ativo' as const,
      emergencyContact: (formData.get('emergencyContact') as string) || null,
      medicalNotes: (formData.get('medicalNotes') as string) || null,
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    playerService
      .create(payload)
      .then(() => {
        setSuccessMessage('Jogador cadastrado com sucesso!')
        event.currentTarget.reset()
        setTimeout(() => navigate('/players'), 800)
      })
      .catch((error) => {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível cadastrar o jogador. Tente novamente.',
        )
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-white hover:text-blue-400"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <div className="rounded-3xl border border-wolves-border bg-wolves-card/70 p-8 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <p className="text-sm uppercase tracking-widest text-blue-400">Adicionar novo membro</p>
            <h2 className="text-3xl font-semibold text-white">Cadastrar Jogador</h2>
          </div>
          <div className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-wolves-muted">
            Ultima atualização • 2 min atrás
          </div>
        </div>

        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          <section className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Informações do Jogador</h3>
              <p className="text-sm text-wolves-muted">Preencha os dados do novo jogador</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Nome Completo *</label>
                <input
                  required
                  name="name"
                  placeholder="João Silva"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Data de Nascimento</label>
                <input
                  type="date"
                  name="birthDate"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Email *</label>
                <input
                  type="email"
                  required
                  name="email"
                  placeholder="joao@email.com"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Telefone</label>
                <input
                  name="phone"
                  placeholder="(11) 99999-9999"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Dados Esportivos</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Posição *</label>
                <select
                  required
                  defaultValue=""
                  name="position"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="" disabled className="bg-wolves-card text-black">
                    Selecione a posição
                  </option>
                  <option value="Ataque" className="text-black">
                    Ataque
                  </option>
                  <option value="Defesa" className="text-black">
                    Defesa
                  </option>
                  <option value="Especial" className="text-black">
                    Especial
                  </option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Número da Camisa</label>
                <input
                  name="jerseyNumber"
                  placeholder="00"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Informações Adicionais</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Contato de Emergência</label>
                <input
                  name="emergencyContact"
                  placeholder="Nome e telefone do contato de emergência"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Informações Médicas</label>
                <textarea
                  rows={5}
                  name="medicalNotes"
                  placeholder="Alergias, medicamentos, condições médicas relevantes..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[180px]"
                />
              </div>
            </div>
          </section>

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-red-300">
              <AlertTriangle size={16} />
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-2xl border border-green-500/40 bg-green-500/5 px-4 py-3 text-sm text-green-300">
              <CheckCircle2 size={16} />
              {successMessage}
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-white/5 pt-6 lg:flex-row lg:justify-end">
            <button
              type="button"
              className="rounded-2xl border border-white/10 px-8 py-3 text-sm font-semibold text-white hover:border-white/30"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-10 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Salvando...' : 'Cadastrar Jogador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterPlayerPage
