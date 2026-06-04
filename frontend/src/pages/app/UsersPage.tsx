import { useEffect, useState } from "react";
import { getAdminUserById, getAdminUsers } from "../../api/adminUserApi";
import UserProfileModal from "../../components/profile/UserProfileModal";
import PaginationControls from "../../components/PaginationControls";
import UserCard from "../../components/users/UserCard";
import type {
  AdminUserDetail,
  AdminUserListItem,
  UserRoleFilter,
} from "../../types/adminUserTypes";
import type { PagedResult } from "../../types/paginationTypes";
import { getToken } from "../../utils/authStorage";

const USERS_PAGE_SIZE = 12;

const emptyUsersPage: PagedResult<AdminUserListItem> = {
  items: [],
  page: 1,
  pageSize: USERS_PAGE_SIZE,
  totalItems: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

function UsersPage() {
  const token = getToken();

  const [usersPage, setUsersPage] =
    useState<PagedResult<AdminUserListItem>>(emptyUsersPage);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(
    null,
  );

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>("all");
  const [page, setPage] = useState(1);

  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadUsers(search, roleFilter, page);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search, roleFilter, page]);

  async function loadUsers(
    searchValue: string,
    roleValue: UserRoleFilter,
    pageValue: number,
  ) {
    if (!token) {
      setError("Sesión no válida.");
      setIsLoadingUsers(false);
      return;
    }

    setError("");
    setIsLoadingUsers(true);

    try {
      const data = await getAdminUsers(token, {
        search: searchValue,
        role: roleValue,
        page: pageValue,
        pageSize: USERS_PAGE_SIZE,
      });

      setUsersPage(data);
    } catch (apiError) {
      console.error(apiError);
      setError("No se han podido cargar los usuarios.");
    } finally {
      setIsLoadingUsers(false);
    }
  }

  async function handleSelectUser(userId: number) {
    if (!token) {
      setError("Sesión no válida.");
      return;
    }

    setError("");

    try {
      const data = await getAdminUserById(userId, token);
      setSelectedUser(data);
    } catch (apiError) {
      console.error(apiError);
      setError("No se ha podido cargar el perfil del usuario.");
    }
  }

  async function refreshSelectedUser(userId: number) {
    if (!token) {
      setError("Sesión no válida.");
      return;
    }

    const [updatedUser, updatedUsersPage] = await Promise.all([
      getAdminUserById(userId, token),
      getAdminUsers(token, {
        search,
        role: roleFilter,
        page,
        pageSize: USERS_PAGE_SIZE,
      }),
    ]);

    setSelectedUser(updatedUser);
    setUsersPage(updatedUsersPage);
  }

  async function handleUserDeleted() {
    await loadUsers(search, roleFilter, page);
    setSelectedUser(null);
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
                roleFilter === "all" ? "users-filter-button-active" : ""
              }`}
              onClick={() => setRoleFilter("all")}
            >
              Todos
            </button>

            <button
              type="button"
              className={`users-filter-button ${
                roleFilter === "Leader" ? "users-filter-button-active" : ""
              }`}
              onClick={() => setRoleFilter("Leader")}
            >
              Líderes
            </button>

            <button
              type="button"
              className={`users-filter-button ${
                roleFilter === "Participant" ? "users-filter-button-active" : ""
              }`}
              onClick={() => setRoleFilter("Participant")}
            >
              Participantes
            </button>
          </div>
        </div>

        {error && <p className="app-error">{error}</p>}

        {isLoadingUsers ? (
          <p className="app-muted">Cargando usuarios...</p>
        ) : usersPage.items.length === 0 ? (
          <p className="app-muted">
            No hay usuarios que coincidan con la búsqueda.
          </p>
        ) : (
          <>
            <div className="users-grid">
              {usersPage.items.map((user) => (
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

            <PaginationControls
              pagination={usersPage}
              isLoading={isLoadingUsers}
              onPageChange={setPage}
            />
          </>
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
  );
}

export default UsersPage;
