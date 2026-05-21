import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { getAvailableParticipants } from "../../api/participantApi";
import { createPick } from "../../api/pickApi";
import { getPublicSystemStatus } from "../../api/systemApi";
import UserCard from "../../components/users/UserCard";
import type {
  AvailableParticipant,
  ParticipantSortBy,
} from "../../types/participantTypes";
import type { SystemStatus } from "../../types/systemTypes";
import { getToken } from "../../utils/authStorage";

type DraftPageProps = {
  onPickCompleted?: () => void;
};

const sortOptions: Array<{
  value: ParticipantSortBy;
  label: string;
}> = [
  { value: "total", label: "Mejor total" },
  { value: "skill1", label: "Creatividad" },
  { value: "skill2", label: "Planificación y análisis" },
  { value: "skill3", label: "Capacidad de trabajo" },
  { value: "skill4", label: "Comunicación" },
];

function getParticipantFullName(participant: AvailableParticipant) {
  return `${participant.firstName} ${participant.lastName}`.trim();
}

function DraftPage({ onPickCompleted }: DraftPageProps) {
  const token = getToken();

  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [participants, setParticipants] = useState<AvailableParticipant[]>([]);
  const [selectedParticipant, setSelectedParticipant] =
    useState<AvailableParticipant | null>(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<ParticipantSortBy>("total");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedParticipants, setHasLoadedParticipants] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [error, setError] = useState("");

  const selectedParticipantName = useMemo(() => {
    if (!selectedParticipant) {
      return "";
    }

    return getParticipantFullName(selectedParticipant);
  }, [selectedParticipant]);

  const selectedSortLabel =
    sortOptions.find((option) => option.value === sortBy)?.label ??
    "Mejor total";

  const isDraftOpen = systemStatus?.isDraftOpen ?? false;
  const isFirstLoad = isLoading && !hasLoadedParticipants;
  const isRefreshing = isLoading && hasLoadedParticipants;

  useEffect(() => {
    void loadStatus({ showInitialLoading: true });
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      if (!document.hidden) {
        void loadStatus({ silent: true });
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!isDraftOpen) {
      setParticipants([]);
      setHasLoadedParticipants(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadParticipants(search, sortBy);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search, sortBy, isDraftOpen]);

  async function loadStatus(
    options: {
      showInitialLoading?: boolean;
      silent?: boolean;
    } = {},
  ) {
    if (!token) {
      setError("Sesión no válida.");
      setIsLoadingStatus(false);
      return null;
    }

    if (options.showInitialLoading) {
      setIsLoadingStatus(true);
    }

    if (!options.silent && !options.showInitialLoading) {
      setIsCheckingStatus(true);
    }

    try {
      const data = await getPublicSystemStatus(token);
      setSystemStatus(data);

      if (!data.isDraftOpen) {
        setSelectedParticipant(null);
        setIsSortOpen(false);
      }

      return data;
    } catch (apiError) {
      console.error(apiError);
      setError("No se ha podido cargar el estado del draft.");
      return null;
    } finally {
      if (options.showInitialLoading) {
        setIsLoadingStatus(false);
      }

      if (!options.silent && !options.showInitialLoading) {
        setIsCheckingStatus(false);
      }
    }
  }

  async function loadParticipants(
    searchValue: string,
    sortValue: ParticipantSortBy,
  ) {
    if (!token) {
      setError("Sesión no válida.");
      setIsLoading(false);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const data = await getAvailableParticipants(token, {
        search: searchValue,
        sortBy: sortValue,
      });

      setParticipants(data);
      setHasLoadedParticipants(true);
    } catch (apiError) {
      console.error(apiError);
      setError("No se han podido cargar los participantes disponibles.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectSort(nextSort: ParticipantSortBy) {
    setSortBy(nextSort);
    setIsSortOpen(false);
  }

  async function handleSelectParticipant(participant: AvailableParticipant) {
    setError("");

    const latestStatus = await loadStatus();

    if (!latestStatus?.isDraftOpen) {
      setSelectedParticipant(null);
      return;
    }

    setSelectedParticipant(participant);
  }

  function closePickModal() {
    if (isPicking) {
      return;
    }

    setSelectedParticipant(null);
  }

  async function handleConfirmPick() {
    if (!token || !selectedParticipant) {
      return;
    }

    setError("");
    setIsPicking(true);

    try {
      const latestStatus = await loadStatus({ silent: true });

      if (!latestStatus?.isDraftOpen) {
        setSelectedParticipant(null);
        setError(
          "El draft está pausado. No se puede hacer el pick ahora mismo.",
        );
        return;
      }

      await createPick(token, {
        userId: selectedParticipant.userId,
      });

      setSelectedParticipant(null);
      onPickCompleted?.();
    } catch (apiError) {
      console.error(apiError);

      setSelectedParticipant(null);
      await loadStatus({ silent: true });

      setError(
        apiError instanceof Error
          ? apiError.message
          : "No se ha podido hacer el pick.",
      );
    } finally {
      setIsPicking(false);
    }
  }

  const pickConfirmationModal =
    selectedParticipant &&
    createPortal(
      <div
        className="draft-confirm-backdrop"
        role="presentation"
        onClick={closePickModal}
      >
        <section
          className="draft-confirm-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar pick"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="profile-modal-heading">
            <div>
              <p className="team-card-kicker">Confirmar elección</p>
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
              ¿Quieres añadir a <strong>{selectedParticipantName}</strong> a tu
              equipo?
            </p>
          </div>

          <div className="profile-form-actions">
            <button
              type="button"
              className="profile-save-button"
              onClick={handleConfirmPick}
              disabled={isPicking}
            >
              {isPicking ? "Eligiendo..." : "Confirmar elección"}
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
    );

  return (
    <>
      <section className="app-section draft-page">
        <div className="section-heading">
          <div>
            <h2>Elegir</h2>
            <p>Busca participantes disponibles y añádelos a tu equipo.</p>
          </div>
        </div>

        {error && <p className="app-error">{error}</p>}

        {isLoadingStatus ? (
          <p className="app-muted">Comprobando estado del draft...</p>
        ) : !isDraftOpen ? (
          <div className="draft-paused-card">
            <p className="team-card-kicker">Draft pausado</p>
            <h3>Las elecciones todavía no están abiertas</h3>
            <p>
              Espera a que la organización comience el draft. Cuando se abra,
              podrás elegir participantes desde esta pestaña.
            </p>

            <button
              type="button"
              className="draft-refresh-button"
              onClick={() => void loadStatus()}
              disabled={isCheckingStatus}
            >
              {isCheckingStatus ? "Comprobando..." : "Comprobar de nuevo"}
            </button>
          </div>
        ) : (
          <>
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
                    className={`draft-sort-trigger ${isSortOpen ? "draft-sort-trigger-open" : ""}`}
                    onClick={() =>
                      setIsSortOpen((currentValue) => !currentValue)
                    }
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
                            sortBy === option.value
                              ? "draft-sort-option-active"
                              : ""
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

            {isCheckingStatus && (
              <p className="draft-refreshing">Comprobando estado...</p>
            )}
            {isRefreshing && (
              <p className="draft-refreshing">Actualizando participantes...</p>
            )}

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
                    onClick={() => void handleSelectParticipant(participant)}
                  />
                ))}
              </div>
            )}
          </>
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
  );
}

export default DraftPage;
