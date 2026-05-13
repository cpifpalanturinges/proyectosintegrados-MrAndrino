import { useEffect, useMemo, useState } from 'react'
import { getAdminUserById, getAdminUsers } from '../../api/adminUserApi'
import UserCard from '../../components/UserCard'
import UserProfileModal from '../../components/UserProfileModal'
import type {
  AdminUserDetail,
  AdminUserListItem,
  UserRoleFilter,
} from '../../types/adminUserTypes'
import { getToken } from '../../utils/authStorage'

function getUserFullName(user: Pick<AdminUserListItem, 'firstName' | 'lastName'>) {
  return `${user.firstName} ${user.lastName}`.trim().toLocaleLowerCase('es')
}

function UsersPage() {
  const token = getToken()

  const [users, setUsers] = useState<AdminUserListItem[]>([])
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('all')

  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [error, setError] = useState('')

  const filteredUsers = useMemo(() => {
    const usersByRole =
      roleFilter === 'all' ? users : users.filter((user) => user.role === roleFilter)

    return [...usersByRole].sort((firstUser, secondUser) =>
      getUserFullName(firstUser).localeCompare(getUserFullName(secondUser), 'es', {
        sensitivity: 'base',
      }),
    )
  }, [users, roleFilter])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadUsers(search)
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [search])

  async function loadUsers(searchValue: string) {
    if (!token) {
      setError('Sesión no válida.')
      setIsLoadingUsers(false)
      return
    }

    setError('')
    setIsLoadingUsers(true)

    try {
      const data = await getAdminUsers(token, searchValue)
      setUsers(data)
    } catch (apiError) {
      console.error(apiError)
      setError('No se han podido cargar los usuarios.')
    } finally {
      setIsLoadingUsers(false)
    }
  }

  async function handleSelectUser(userId: number) {
    if (!token) {
      setError('Sesión no válida.')
      return
    }

    setError('')

    try {
      const data = await getAdminUserById(userId, token)
      setSelectedUser(data)
    } catch (apiError) {
      console.error(apiError)
      setError('No se ha podido cargar el perfil del usuario.')
    }
  }

  async function refreshSelectedUser(userId: number) {
    if (!token) {
      setError('Sesión no válida.')
      return
    }

    const [updatedUser, updatedUsers] = await Promise.all([
      getAdminUserById(userId, token),
      getAdminUsers(token, search),
    ])

    setSelectedUser(updatedUser)
    setUsers(updatedUsers)
  }

  async function handleUserDeleted() {
    await loadUsers(search)
    setSelectedUser(null)
  }

  return (
    <>
      <section className="app-section users-page">
        <div className="section-heading">
          <div>
            <h2>Usuarios</h2>
            <p>Consulta y gestiona líderes y participantes del evento.</p>
          </div>
        </div>

        <div className="users-toolbar">
          <label className="app-search-label users-search">
            Buscar usuario
            <input
              type="search"
              value={search}
              placeholder=""
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <div className="users-filter" aria-label="Filtro de usuarios">
            <button
              type="button"
              className={`users-filter-button ${
                roleFilter === 'all' ? 'users-filter-button-active' : ''
              }`}
              onClick={() => setRoleFilter('all')}
            >
              Todos
            </button>

            <button
              type="button"
              className={`users-filter-button ${
                roleFilter === 'Leader' ? 'users-filter-button-active' : ''
              }`}
              onClick={() => setRoleFilter('Leader')}
            >
              Líderes
            </button>

            <button
              type="button"
              className={`users-filter-button ${
                roleFilter === 'Participant' ? 'users-filter-button-active' : ''
              }`}
              onClick={() => setRoleFilter('Participant')}
            >
              Participantes
            </button>
          </div>
        </div>

        {error && <p className="app-error">{error}</p>}

        {isLoadingUsers ? (
          <p className="app-muted">Cargando usuarios...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="app-muted">No hay usuarios que coincidan con la búsqueda.</p>
        ) : (
          <div className="users-grid">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.userId}
                user={user}
                showRole
                showSkills={false}
                clickable
                onClick={() => handleSelectUser(user.userId)}
              />
            ))}
          </div>
        )}
      </section>

      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          title="Perfil de usuario"
          canManage
          showDangerActions
          onClose={() => setSelectedUser(null)}
          onUserChanged={refreshSelectedUser}
          onUserDeleted={handleUserDeleted}
        />
      )}
    </>
  )
}

export default UsersPage