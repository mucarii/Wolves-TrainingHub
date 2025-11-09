import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { playerService } from '../services/playerService'
import type { PlayerPosition, PlayerShortPosition } from '../types/player'

const mapPositionToShort = (position: PlayerPosition): PlayerShortPosition => {
  switch (position) {
    case 'Ataque':
      return 'atk'
    case 'Defesa':
      return 'def'
    default:
      return 'esp'
  }
}

type FormState = {
  name: string
  email: string
  phone: string
  position: PlayerPosition
  emergencyContact: string
  medicalNotes: string
}

const defaultForm: FormState = {
  name: '',
  email: '',
  phone: '',
  position: 'Ataque',
  emergencyContact: '',
  medicalNotes: '',
}

const EditPlayerPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const playerId = Number(id)

  const [formState, setFormState] = useState<FormState>(defaultForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!playerId) {
      navigate('/players')
      return
    }

    const loadPlayer = async () => {
      try {
        setIsLoading(true)
        const player = await playerService.getById(playerId)
        setFormState({
          name: player.name,
          email: player.email,
          phone: player.phone ?? '',
          position: player.position,
          emergencyContact: player.emergencyContact ?? '',
          medicalNotes: player.medicalNotes ?? '',
        })
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Não foi possível carregar o jogador.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadPlayer()
  }, [playerId, navigate])

  const handleChange =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormState((prev) => ({
        ...prev,
        [field]: event.target.value,
      }))
    }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!playerId) return

    try {
      setIsSaving(true)
      setErrorMessage(null)
      setSuccessMessage(null)
      await playerService.update(playerId, {
        name: formState.name,
        email: formState.email,
        phone: formState.phone || null,
        position: formState.position,
        shortPosition: mapPositionToShort(formState.position),
        emergencyContact: formState.emergencyContact || null,
        medicalNotes: formState.medicalNotes || null,
      })
      setSuccessMessage('Dados atualizados com sucesso!')
      setTimeout(() => navigate('/players'), 1000)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível atualizar o jogador.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (!playerId) {
    return null
  }

  return (
    <div className="space-y-6">
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
            <p className="text-sm uppercase tracking-widest text-blue-400">Editar jogador</p>
            <h2 className="text-3xl font-semibold text-white">Atualizar informações</h2>
          </div>
          <div className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-wolves-muted">
            ID #{playerId}
          </div>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-wolves-muted">Carregando dados do jogador...</p>
        ) : (
          <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
            <section className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Informações do Jogador</h3>
                <p className="text-sm text-wolves-muted">Atualize os dados necessários</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Nome Completo *</label>
                  <input
                    required
                    value={formState.name}
                    onChange={handleChange('name')}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Email *</label>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={handleChange('email')}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Telefone</label>
                  <input
                    value={formState.phone}
                    onChange={handleChange('phone')}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Posição *</label>
                  <select
                    value={formState.position}
                    onChange={handleChange('position')}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
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
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Informações Adicionais</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">
                    Contato de Emergência
                  </label>
                  <input
                    value={formState.emergencyContact}
                    onChange={handleChange('emergencyContact')}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Informações Médicas</label>
                  <textarea
                    rows={3}
                    value={formState.medicalNotes}
                    onChange={handleChange('medicalNotes')}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
                onClick={() => navigate('/players')}
                className="rounded-2xl border border-white/10 px-8 py-3 text-sm font-semibold text-white hover:border-white/30"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-10 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Salvando...' : 'Atualizar Jogador'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default EditPlayerPage
