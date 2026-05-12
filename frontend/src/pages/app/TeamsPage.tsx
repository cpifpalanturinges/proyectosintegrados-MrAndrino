import { useEffect, useState } from 'react'
import { getTeamById, getTeams } from '../../api/teamApi'
import UserCard from '../../components/UserCard'
import type { TeamDetail, TeamListItem } from '../../types/teamTypes'
import { getToken } from '../../utils/authStorage'

function TeamsPage() {
  const token = getToken()

  const [teams, setTeams] = useState<TeamListItem[]>([])
  const [selectedTeam, setSelectedTeam] = useState<TeamDetail | null>(null)

  const [search, setSearch] = useState('')
  const [isLoadingTeams, setIsLoadingTeams] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadTeams(search)
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [search])

  async function loadTeams(searchValue: string) {
    if (!token) {
      setError('Sesión no válida.')
      setIsLoadingTeams(false)
      return
    }

    setError('')
    setIsLoadingTeams(true)

    try {
      const data = await getTeams(token, searchValue)
      setTeams(data)
    } catch (apiError) {
      console.error(apiError)
      setError('No se han podido cargar los equipos.')
    } finally {
      setIsLoadingTeams(false)
    }
  }

  async function handleSelectTeam(teamId: number) {
    if (!token) {
      setError('Sesión no válida.')
      return
    }

    setError('')
    setIsLoadingDetail(true)

    try {
      const data = await getTeamById(token, teamId)
      setSelectedTeam(data)
    } catch (apiError) {
      console.error(apiError)
      setError('No se ha podido cargar el detalle del equipo.')
    } finally {
      setIsLoadingDetail(false)
    }
  }

  function closeTeamDetail() {
    setSelectedTeam(null)
  }

  return (
    <section className="app-section teams-page">
      <div className="section-heading">
        <div>
          <h2>Equipos</h2>
          <p>Consulta los equipos del evento y sus integrantes.</p>
        </div>
      </div>

      <label className="app-search-label">
        Buscar equipo o líder
        <input
          type="search"
          value={search}
          placeholder=""
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>

      {error && <p className="app-error">{error}</p>}

      {isLoadingTeams ? (
        <p className="app-muted">Cargando equipos...</p>
      ) : teams.length === 0 ? (
        <p className="app-muted">No hay equipos que coincidan con la búsqueda.</p>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => (
            <button
              type="button"
              className="team-card"
              key={team.teamId}
              onClick={() => handleSelectTeam(team.teamId)}
            >
              <span className="team-card-kicker">Equipo</span>
              <strong>{team.name}</strong>
              <span>Líder: {team.leaderName}</span>
              <span>{team.membersCount} miembros</span>
            </button>
          ))}
        </div>
      )}

      {selectedTeam && (
        <div className="team-detail-backdrop" role="presentation" onClick={closeTeamDetail}>
          <section
            className="team-detail-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Detalle del equipo"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="team-detail-header">
              <div>
                <p className="team-card-kicker">Equipo</p>
                <h3>{selectedTeam.name}</h3>
              </div>

              <button type="button" className="team-detail-close" onClick={closeTeamDetail}>
                Cerrar
              </button>
            </div>

            {isLoadingDetail ? (
              <p className="app-muted">Cargando detalle...</p>
            ) : (
              <>
                <div className="team-detail-block">
                  <h4>Líder</h4>
                  <UserCard user={selectedTeam.leader} />
                </div>

                <div className="team-detail-block">
                  <h4>Miembros</h4>

                  {selectedTeam.members.length === 0 ? (
                    <p className="app-muted">Este equipo todavía no tiene miembros.</p>
                  ) : (
                    <div className="team-members-list">
                      {selectedTeam.members.map((member) => (
                        <UserCard key={member.userId} user={member} showPickOrder />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </section>
  )
}

export default TeamsPage