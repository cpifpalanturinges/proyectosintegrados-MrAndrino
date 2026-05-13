import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { getAvailableParticipants } from '../../api/participantApi'
import { createPick } from '../../api/pickApi'
import UserCard from '../../components/UserCard'
import type { AvailableParticipant, ParticipantSortBy } from '../../types/participantTypes'
import { getToken } from '../../utils/authStorage'

type DraftPageProps = {
  onPickCompleted?: () => void
}

const sortOptions: Array<{
  value: ParticipantSortBy
  label: string
}> = [
  { value: 'total', label: 'Mejor total' },
  { value: 'skill1', label: 'Skill 1' },
  { value: 'skill2', label: 'Skill 2' },
  { value: 'skill3', label: 'Skill 3' },
  { value: 'skill4', label: 'Skill 4' },
]

function getParticipantFullName(participant: AvailableParticipant) {
  return `${participant.firstName} ${participant.lastName}`.trim()
}

function DraftPage({ onPickCompleted }: DraftPageProps) {
  const token = getToken()

  const [participants, setParticipants] = useState<AvailableParticipant[]>([])
  const [selectedParticipant, setSelectedParticipant] = useState<AvailableParticipant | null>(null)

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<ParticipantSortBy>('total')
  const [isSortOpen, setIsSortOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadedParticipants, setHasLoadedParticipants] = useState(false)
  const [isPicking, setIsPicking] = useState(false)
  const [error, setError] = useState('')

  const selectedParticipantName = useMemo(() => {
    if (!selectedParticipant) {
      return ''
    }

    return getParticipantFullName(selectedParticipant)
  }, [selectedParticipant])

  const selectedSortLabel =
    sortOptions.find((option) => option.value === sortBy)?.label ?? 'Mejor total'

  const isFirstLoad = isLoading && !hasLoadedParticipants
  const isRefreshing = isLoading && hasLoadedParticipants

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadParticipants(search, sortBy)
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [search, sortBy])

  async function loadParticipants(searchValue: string, sortValue: ParticipantSortBy) {
    if (!token) {
      setError('Sesión no válida.')
      setIsLoading(false)
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const data = await getAvailableParticipants(token, {
        search: searchValue,
        sortBy: sortValue,
      })

      setParticipants(data)
      setHasLoadedParticipants(true)
    } catch (apiError) {
      console.error(apiError)
      setError('No se han podido cargar los participantes disponibles.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleSelectSort(nextSort: ParticipantSortBy) {
    setSortBy(nextSort)
    setIsSortOpen(false)
  }

  function closePickModal() {
    if (isPicking) {
      return
    }

    setSelectedParticipant(null)
  }

  async function handleConfirmPick() {
    if (!token || !selectedParticipant) {
      return
    }

    setError('')
    setIsPicking(true)

    try {
      await createPick(token, {
        userId: selectedParticipant.userId,
      })

      setSelectedParticipant(null)
      onPickCompleted?.()
    } catch (apiError) {
      console.error(apiError)
      setError(apiError instanceof Error ? apiError.message : 'No se ha podido hacer el pick.')
    } finally {
      setIsPicking(false)
    }
  }

  const pickConfirmationModal =
    selectedParticipant &&
    createPortal(
      <div className="draft-confirm-backdrop" role="presentation" onClick={closePickModal}>
        <section
          className="draft-confirm-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar pick"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="profile-modal-heading">
            <div>
              <p className="team-card-kicker">Confirmar pick</p>
              <h2>Elegir participante</h2>
            </div>

            <button
              type="button"
              className="profile-modal-close"
              onClick={closePickModal}
              aria-label="Cerrar modal"
              disabled={isPicking}
            >
              ×
            </button>
          </div>

          <UserCard user={selectedParticipant} variant="profile" />

          <div className="draft-confirm-copy">
            <p>
              ¿Quieres añadir a <strong>{selectedParticipantName}</strong> a tu equipo?
            </p>
          </div>

          <div className="profile-form-actions">
            <button
              type="button"
              className="profile-save-button"
              onClick={handleConfirmPick}
              disabled={isPicking}
            >
              {isPicking ? 'Eligiendo...' : 'Confirmar pick'}
            </button>

            <button
              type="button"
              className="profile-cancel-button"
              onClick={closePickModal}
              disabled={isPicking}
            >
              Cancelar
            </button>
          </div>
        </section>
      </div>,
      document.body,
    )

  return (
    <>
      <section className="app-section draft-page">
        <div className="section-heading">
          <div>
            <h2>Elegir</h2>
            <p>Busca participantes disponibles y añádelos a tu equipo.</p>
          </div>
        </div>

        <div className="draft-toolbar">
          <label className="app-search-label draft-search">
            Buscar participante
            <input
              type="search"
              value={search}
              placeholder=""
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <div className="draft-sort-label">
            <span>Ordenar por</span>

            <div className="draft-sort-dropdown">
              <button
                type="button"
                className={`draft-sort-trigger ${isSortOpen ? 'draft-sort-trigger-open' : ''}`}
                onClick={() => setIsSortOpen((currentValue) => !currentValue)}
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
              >
                <span>{selectedSortLabel}</span>
                <span className="draft-sort-chevron">⌄</span>
              </button>

              {isSortOpen && (
                <div className="draft-sort-menu" role="listbox">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`draft-sort-option ${
                        sortBy === option.value ? 'draft-sort-option-active' : ''
                      }`}
                      onClick={() => handleSelectSort(option.value)}
                      role="option"
                      aria-selected={sortBy === option.value}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <p className="app-error">{error}</p>}

        {isRefreshing && <p className="draft-refreshing">Actualizando participantes...</p>}

        {isFirstLoad ? (
          <p className="app-muted">Cargando participantes...</p>
        ) : participants.length === 0 ? (
          <p className="app-muted">No hay participantes disponibles.</p>
        ) : (
          <div className="draft-grid">
            {participants.map((participant) => (
              <UserCard
                key={participant.userId}
                user={participant}
                clickable
                onClick={() => setSelectedParticipant(participant)}
              />
            ))}
          </div>
        )}

        {isSortOpen && (
          <button
            type="button"
            className="draft-sort-click-outside"
            aria-label="Cerrar desplegable"
            onClick={() => setIsSortOpen(false)}
          />
        )}
      </section>

      {pickConfirmationModal}
    </>
  )
}

export default DraftPage