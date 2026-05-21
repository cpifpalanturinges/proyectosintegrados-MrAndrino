import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getAdminUserById } from "../../api/adminUserApi";
import { createCoordinator, getCoordinators } from "../../api/systemApi";
import type { CoordinatorListItem } from "../../types/organizerTypes";
import UserProfileContent, {
  type UserProfileModalData,
} from "../profile/UserProfileContent";
import PhotoInput from "../auth/PhotoInput";
import { getPhotoUrl } from "../../utils/photoUrl";

type OrganizersView = "list" | "create" | "profile";
type OrganizersViewDirection = "forward" | "back";

type OrganizersModalProps = {
  isOpen: boolean;
  isClosing: boolean;
  token: string | null;
  canCreateCoordinators: boolean;
  onClose: () => void;
};

function getCoordinatorName(coordinator: CoordinatorListItem) {
  return `${coordinator.firstName} ${coordinator.lastName}`.trim();
}

function OrganizersModal({
  isOpen,
  isClosing,
  token,
  canCreateCoordinators,
  onClose,
}: OrganizersModalProps) {
  const [coordinators, setCoordinators] = useState<CoordinatorListItem[]>([]);
  const [selectedCoordinator, setSelectedCoordinator] =
    useState<UserProfileModalData | null>(null);

  const [activeView, setActiveView] = useState<OrganizersView>("list");
  const [viewDirection, setViewDirection] =
    useState<OrganizersViewDirection>("forward");

  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createFormKey, setCreateFormKey] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setActiveView("list");
    setViewDirection("forward");
    setSelectedCoordinator(null);
    void loadCoordinators();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeView !== "list") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadCoordinators();
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search, isOpen, activeView]);

  async function loadCoordinators() {
    if (!token) {
      setError("Sesión no válida.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const data = await getCoordinators(token, search);
      setCoordinators(data);
    } catch (apiError) {
      console.error(apiError);
      setError("No se han podido cargar los coordinadores.");
    } finally {
      setIsLoading(false);
    }
  }

  function goToList(direction: OrganizersViewDirection = "back") {
    setError("");
    setViewDirection(direction);
    setActiveView("list");
    setSelectedCoordinator(null);
  }

  function goToCreate() {
    if (!canCreateCoordinators) {
      return;
    }

    setError("");
    setViewDirection("forward");
    setCreateFormKey((currentValue) => currentValue + 1);
    setActiveView("create");
  }

  async function openCoordinatorProfile(coordinatorId: number) {
    if (!token) {
      setError("Sesión no válida.");
      return;
    }

    setError("");
    setIsLoadingProfile(true);

    try {
      const user = await getAdminUserById(coordinatorId, token);

      setSelectedCoordinator(user);
      setViewDirection("forward");
      setActiveView("profile");
    } catch (apiError) {
      console.error(apiError);
      setError("No se ha podido cargar el perfil del coordinador.");
    } finally {
      setIsLoadingProfile(false);
    }
  }

  async function refreshSelectedCoordinator(userId: number) {
    if (!token) {
      return;
    }

    const user = await getAdminUserById(userId, token);
    setSelectedCoordinator(user);
    await loadCoordinators();
  }

  async function handleCoordinatorDeleted() {
    goToList("back");
    await loadCoordinators();
  }

  async function handleCreateCoordinator(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token || !canCreateCoordinators) {
      return;
    }

    const formData = new FormData(event.currentTarget);

    setError("");
    setIsCreating(true);

    try {
      await createCoordinator(token, formData);

      setCreateFormKey((currentValue) => currentValue + 1);
      goToList("back");
      await loadCoordinators();
    } catch (apiError) {
      console.error(apiError);
      setError(
        apiError instanceof Error
          ? apiError.message
          : "No se ha podido crear el coordinador.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className={`system-modal-backdrop ${isClosing ? "modal-closing" : ""}`}
      role="presentation"
      onClick={onClose}
    >
      <section
        className="system-modal-panel system-organizers-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Gestionar organizadores"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          key={activeView}
          className={`profile-content-view profile-content-view-${viewDirection}`}
        >
          {activeView === "list" && (
            <>
              <div className="profile-modal-heading">
                <div>
                  <p className="team-card-kicker">Coordinadores</p>
                  <h2>Gestionar coordinadores</h2>
                </div>

                <button
                  type="button"
                  className="profile-modal-close"
                  onClick={onClose}
                  aria-label="Cerrar modal"
                  disabled={isCreating}
                >
                  ×
                </button>
              </div>

              {error && <p className="app-error">{error}</p>}

              <div className="system-modal-toolbar">
                <label className="app-search-label system-search-label">
                  Buscar coordinador
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>

                {canCreateCoordinators && (
                  <button
                    type="button"
                    className="system-primary-button"
                    onClick={goToCreate}
                    disabled={isCreating}
                  >
                    Crear coordinador
                  </button>
                )}
              </div>

              {isLoadingProfile && (
                <p className="draft-refreshing">Cargando perfil...</p>
              )}

              {isLoading ? (
                <p className="app-muted">Cargando organizadores...</p>
              ) : coordinators.length === 0 ? (
                <p className="app-muted">No hay coordinadores registrados.</p>
              ) : (
                <div className="system-organizers-list">
                  {coordinators.map((coordinator) => (
                    <button
                      key={coordinator.userId}
                      type="button"
                      className="system-organizer-card"
                      onClick={() =>
                        void openCoordinatorProfile(coordinator.userId)
                      }
                      disabled={isLoadingProfile}
                    >
                      <img
                        src={getPhotoUrl(coordinator.photoPath)}
                        alt={getCoordinatorName(coordinator)}
                        className="system-organizer-photo"
                      />

                      <div>
                        <strong>{getCoordinatorName(coordinator)}</strong>
                        <p>@{coordinator.username}</p>
                        <span>Coordinador</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {activeView === "create" && canCreateCoordinators && (
            <>
              <div className="profile-modal-heading">
                <div>
                  <button
                    type="button"
                    className="profile-back-button"
                    onClick={() => goToList("back")}
                  >
                    ← Cooordinadores
                  </button>

                  <p className="team-card-kicker">Coordinadores</p>
                  <h2>Crear coordinador</h2>
                </div>

                <button
                  type="button"
                  className="profile-modal-close"
                  onClick={onClose}
                  aria-label="Cerrar modal"
                  disabled={isCreating}
                >
                  ×
                </button>
              </div>

              {error && <p className="app-error">{error}</p>}

              <form
                key={createFormKey}
                className="system-create-form"
                onSubmit={handleCreateCoordinator}
              >
                <div className="profile-form-grid">
                  <label className="profile-form-field">
                    Nombre
                    <input name="firstName" disabled={isCreating} required />
                  </label>

                  <label className="profile-form-field">
                    Apellidos
                    <input name="lastName" disabled={isCreating} required />
                  </label>

                  <label className="profile-form-field">
                    Usuario
                    <input name="username" disabled={isCreating} required />
                  </label>

                  <label className="profile-form-field">
                    Contraseña
                    <input
                      name="password"
                      type="password"
                      disabled={isCreating}
                      required
                    />
                  </label>

                  <div className="profile-form-field profile-form-field--full">
                    Foto opcional
                    <PhotoInput />
                  </div>
                </div>

                <div className="profile-form-actions">
                  <button
                    type="submit"
                    className="profile-save-button"
                    disabled={isCreating}
                  >
                    {isCreating ? "Creando..." : "Crear coordinador"}
                  </button>

                  <button
                    type="button"
                    className="profile-cancel-button"
                    onClick={() => goToList("back")}
                    disabled={isCreating}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </>
          )}

          {activeView === "profile" && selectedCoordinator && (
            <UserProfileContent
              user={selectedCoordinator}
              title="Perfil de coordinador"
              canManage={canCreateCoordinators}
              showDangerActions={canCreateCoordinators}
              onClose={onClose}
              onBack={() => goToList("back")}
              backLabel="Organizadores"
              onUserChanged={refreshSelectedCoordinator}
              onUserDeleted={handleCoordinatorDeleted}
            />
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}

export default OrganizersModal;
