import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getAdminUserById } from '../../api/adminUserApi'
import { getTeamById, getTeams } from '../../api/teamApi'
import UserCard from '../../components/UserCard'
import UserProfileContent, { type UserProfileModalData } from '../../components/UserProfileContent'
import { useAnimatedModalClose } from '../../hooks/useAnimatedModalClose'
import type { TeamDetail, TeamListItem } from '../../types/teamTypes'
import { getStoredUser, getToken } from '../../utils/authStorage'

type TeamUserKind = 'leader' | 'member'
type TeamModalView = 'team' | 'user'
type TeamModalDirection = 'forward' | 'back'

function TeamsPage() {
  const token = getToken()
  const currentUser = getStoredUser()
  const canManageUsers = currentUser?.role === 'Admin' || currentUser?.role === 'Coordinator'

  const [teams, setTeams] = useState<TeamListItem[]>([])
  const [selectedTeam, setSelectedTeam] = useState<TeamDetail | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserProfileModalData | null>(null)

  const [modalView, setModalView] = useState<TeamModalView>('team')
  const [modalDirection, setModalDirection] = useState<TeamModalDirection>('forward')

  const [search, setSearch] = useState('')
  const [isLoadingTeams, setIsLoadingTeams] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [error, setError] = useState('')

  const {
    isClosing: isTeamModalClosing,
    closeWithAnimation: closeTeamDetailWithAnimation,
    resetClosingState: resetTeamModalClosingState,
  } = useAnimatedModalClose(closeTeamDetail)

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
      setSelectedUser(null)
      setModalView('team')
      setModalDirection('forward')
      resetTeamModalClosingState()
    } catch (apiError) {
      console.error(apiError)
      setError('No se ha podido cargar el detalle del equipo.')
    } finally {
      setIsLoadingDetail(false)
    }
  }

  function closeTeamDetail() {
    setSelectedTeam(null)
    setSelectedUser(null)
    setModalView('team')
    setModalDirection('forward')
  }

  async function refreshSelectedTeam() {
    if (!token || !selectedTeam) {
      return
    }

    const updatedTeam = await getTeamById(token, selectedTeam.teamId)
    setSelectedTeam(updatedTeam)
  }

  async function refreshSelectedTeamUser(userId: number) {
    if (!token) {
      setError('Sesión no válida.')
      return
    }

    if (canManageUsers) {
      const [updatedUser] = await Promise.all([
        getAdminUserById(userId, token),
        refreshSelectedTeam(),
        loadTeams(search),
      ])

      setSelectedUser(updatedUser)
      return
    }

    await refreshSelectedTeam()
  }

  async function handleUserDeletedFromTeam() {
    setSelectedUser(null)
    setModalView('team')
    setModalDirection('back')

    if (selectedTeam) {
      try {
        await refreshSelectedTeam()
      } catch {
        setSelectedTeam(null)
      }
    }

    await loadTeams(search)
  }

  async function handleSelectTeamUser(
    user: TeamDetail['leader'] | TeamDetail['members'][number],
    kind: TeamUserKind,
  ) {
    if (!token || !selectedTeam) {
      setError('Sesión no válida.')
      return
    }

    setError('')

    if (canManageUsers) {
      try {
        const data = await getAdminUserById(user.userId, token)
        setSelectedUser(data)
        setModalDirection('forward')
        setModalView('user')
      } catch (apiError) {
        console.error(apiError)
        setError('No se ha podido cargar el perfil del usuario.')
      }

      return
    }

    setSelectedUser({
      userId: user.userId,
      username: '',
      role: kind === 'leader' ? 'Leader' : 'Participant',
      firstName: user.firstName,
      lastName: user.lastName,
      photoPath: user.photoPath,
      studies: user.studies,
      skill1: user.skill1,
      skill2: user.skill2,
      skill3: user.skill3,
      skill4: user.skill4,
      assignedTeamId: selectedTeam.teamId,
      assignedTeamName: selectedTeam.name,
      pickId: kind === 'member' ? user.pickId : null,
    })

    setModalDirection('forward')
    setModalView('user')
  }

  function handleBackToTeam() {
    setModalDirection('back')
    setModalView('team')
  }

  const teamModal =
    selectedTeam &&
    createPortal(
      <div
        className={`team-detail-backdrop ${isTeamModalClosing ? 'modal-closing' : ''}`}
        role="presentation"
        onClick={closeTeamDetailWithAnimation}
      >
        <section
          className="team-detail-panel"
          role="dialog"
          aria-modal="true"
          aria-label={modalView === 'team' ? 'Detalle del equipo' : 'Perfil de usuario'}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            key={modalView}
            className={`team-modal-view team-modal-view-${modalDirection} team-modal-view-${modalView}`}
          >
            {modalView === 'team' && (
              <>
                <div className="team-detail-header">
                  <div>
                    <p className="team-card-kicker">Equipo</p>
                    <h3>{selectedTeam.name}</h3>
                  </div>

                  <button
                    type="button"
                    className="team-detail-close"
                    onClick={closeTeamDetailWithAnimation}
                    aria-label="Cerrar modal"
                  >
                    ×
                  </button>
                </div>

                {isLoadingDetail ? (
                  <p className="app-muted">Cargando detalle...</p>
                ) : (
                  <>
                    <div className="team-detail-block">
                      <h4>Líder</h4>

                      <UserCard
                        user={selectedTeam.leader}
                        clickable
                        onClick={() => handleSelectTeamUser(selectedTeam.leader, 'leader')}
                      />
                    </div>

                    <div className="team-detail-block">
                      <h4>Miembros</h4>

                      {selectedTeam.members.length === 0 ? (
                        <p className="app-muted">Este equipo todavía no tiene miembros.</p>
                      ) : (
                        <div className="team-members-list">
                          {selectedTeam.members.map((member) => (
                            <UserCard
                              key={member.userId}
                              user={member}
                              showPickOrder
                              clickable
                              onClick={() => handleSelectTeamUser(member, 'member')}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {modalView === 'user' && selectedUser && (
              <UserProfileContent
                user={selectedUser}
                title="Perfil de usuario"
                canManage={canManageUsers}
                showDangerActions={canManageUsers}
                onClose={closeTeamDetailWithAnimation}
                onBack={handleBackToTeam}
                backLabel="Volver al equipo"
                onUserChanged={refreshSelectedTeamUser}
                onUserDeleted={handleUserDeletedFromTeam}
              />
            )}
          </div>
        </section>
      </div>,
      document.body,
    )

  return (
    <>
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
      </section>

      {teamModal}
    </>
  )
}

export default TeamsPage