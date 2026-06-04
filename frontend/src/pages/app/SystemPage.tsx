import { useEffect, useState } from "react";
import {
  getPicksHistory,
  getSystemStatus,
  openDraft,
  pauseDraft,
  resetSystem,
  undoPick,
} from "../../api/systemApi";
import OrganizersModal from "../../components/system/OrganizersModal";
import PickDisplayWindow from "../../components/system/PickDisplayWindow";
import PickHistoryModal from "../../components/system/PickHistoryModal";
import ResetEventConfirmationModal from "../../components/system/ResetEventConfirmationModal";
import ResetEventSuccessModal from "../../components/system/ResetEventSuccessModal";
import SystemActionCard from "../../components/system/SystemActionCard";
import SystemDraftStatusCard from "../../components/system/SystemDraftStatusCard";
import UndoPickConfirmationModal from "../../components/system/UndoPickConfirmationModal";
import { useAnimatedModalClose } from "../../hooks/useAnimatedModalClose";
import type { PagedResult } from "../../types/paginationTypes";
import type { PickHistoryItem } from "../../types/pickHistoryTypes";
import type { SystemStatus } from "../../types/systemTypes";
import { getStoredUser, getToken } from "../../utils/authStorage";

const PICKS_PAGE_SIZE = 10;

const emptyPicksPage: PagedResult<PickHistoryItem> = {
  items: [],
  page: 1,
  pageSize: PICKS_PAGE_SIZE,
  totalItems: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getPickUserName(pick: PickHistoryItem) {
  return `${pick.firstName} ${pick.lastName}`.trim();
}

function SystemPage() {
  const token = getToken();
  const currentUser = getStoredUser();

  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [picksPage, setPicksPage] =
    useState<PagedResult<PickHistoryItem>>(emptyPicksPage);
  const [picksPageNumber, setPicksPageNumber] = useState(1);

  const [isPickHistoryOpen, setIsPickHistoryOpen] = useState(false);
  const [isOrganizersOpen, setIsOrganizersOpen] = useState(false);
  const [pickDisplayWindow, setPickDisplayWindow] = useState<Window | null>(
    null,
  );
  const [isResetConfirmationOpen, setIsResetConfirmationOpen] = useState(false);
  const [isResetSuccessOpen, setIsResetSuccessOpen] = useState(false);

  const [pickToUndo, setPickToUndo] = useState<PickHistoryItem | null>(null);

  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingPicks, setIsLoadingPicks] = useState(false);
  const [hasLoadedPicks, setHasLoadedPicks] = useState(false);

  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [undoingPickId, setUndoingPickId] = useState<number | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const [error, setError] = useState("");

  const {
    isClosing: isPickHistoryClosing,
    closeWithAnimation: closePickHistoryWithAnimation,
    resetClosingState: resetPickHistoryClosingState,
  } = useAnimatedModalClose(closePickHistory);

  const {
    isClosing: isUndoConfirmationClosing,
    closeWithAnimation: closeUndoConfirmationWithAnimation,
    resetClosingState: resetUndoConfirmationClosingState,
  } = useAnimatedModalClose(closeUndoConfirmation);

  const {
    isClosing: isOrganizersClosing,
    closeWithAnimation: closeOrganizersWithAnimation,
    resetClosingState: resetOrganizersClosingState,
  } = useAnimatedModalClose(closeOrganizers);

  const {
    isClosing: isResetConfirmationClosing,
    closeWithAnimation: closeResetConfirmationWithAnimation,
    resetClosingState: resetResetConfirmationClosingState,
  } = useAnimatedModalClose(closeResetConfirmation);

  const {
    isClosing: isResetSuccessClosing,
    closeWithAnimation: closeResetSuccessWithAnimation,
    resetClosingState: resetResetSuccessClosingState,
  } = useAnimatedModalClose(closeResetSuccess);

  const isAdmin = currentUser?.role === "Admin";
  const canCreateCoordinators = isAdmin;

  useEffect(() => {
    void loadStatus();
  }, []);

  async function loadStatus() {
    if (!token) {
      setError("Sesión no válida.");
      setIsLoadingStatus(false);
      return;
    }

    setError("");
    setIsLoadingStatus(true);

    try {
      const data = await getSystemStatus(token);
      setStatus(data);
    } catch (apiError) {
      console.error(apiError);
      setError("No se ha podido cargar el estado del sistema.");
    } finally {
      setIsLoadingStatus(false);
    }
  }

  async function loadPicks(pageValue = picksPageNumber) {
    if (!token) {
      setError("Sesión no válida.");
      setIsLoadingPicks(false);
      return;
    }

    setError("");
    setIsLoadingPicks(true);

    try {
      const data = await getPicksHistory(token, {
        page: pageValue,
        pageSize: PICKS_PAGE_SIZE,
      });

      setPicksPage(data);
      setPicksPageNumber(data.page || 1);
      setHasLoadedPicks(true);
    } catch (apiError) {
      console.error(apiError);
      setError("No se ha podido cargar el historial de picks.");
    } finally {
      setIsLoadingPicks(false);
    }
  }

  async function openPickHistory() {
    resetPickHistoryClosingState();
    setIsPickHistoryOpen(true);

    if (!hasLoadedPicks) {
      setPicksPageNumber(1);
      await loadPicks(1);
    }
  }

  function closePickHistory() {
    if (undoingPickId) {
      return;
    }

    setIsPickHistoryOpen(false);
    setPickToUndo(null);
  }

  function openOrganizers() {
    resetOrganizersClosingState();
    setIsOrganizersOpen(true);
  }

  function closeOrganizers() {
    setIsOrganizersOpen(false);
  }

  function openPickDisplay() {
    const popup = window.open(
      "",
      "teamdraft-pick-display",
      "width=1440,height=900,left=120,top=80",
    );

    if (!popup) {
      setError(
        "El navegador ha bloqueado la ventana del display. Permite ventanas emergentes.",
      );
      return;
    }

    setError("");
    setPickDisplayWindow(popup);
    popup.focus();
  }

  function closePickDisplay() {
    if (pickDisplayWindow && !pickDisplayWindow.closed) {
      pickDisplayWindow.close();
    }

    setPickDisplayWindow(null);
  }

  function openResetConfirmation() {
    if (!isAdmin) {
      return;
    }

    resetResetConfirmationClosingState();
    setIsResetConfirmationOpen(true);
  }

  function closeResetConfirmation() {
    if (isResetting) {
      return;
    }

    setIsResetConfirmationOpen(false);
  }

  function openResetSuccess() {
    resetResetSuccessClosingState();
    setIsResetSuccessOpen(true);
  }

  function closeResetSuccess() {
    setIsResetSuccessOpen(false);
  }

  async function handleToggleDraft() {
    if (!token || !status) {
      return;
    }

    setError("");
    setIsSavingStatus(true);

    try {
      const updatedStatus = status.isDraftOpen
        ? await pauseDraft(token)
        : await openDraft(token);
      setStatus(updatedStatus);
    } catch (apiError) {
      console.error(apiError);
      setError("No se ha podido actualizar el estado del draft.");
    } finally {
      setIsSavingStatus(false);
    }
  }

  function requestUndoPick(pick: PickHistoryItem) {
    if (pick.isCancelled) {
      return;
    }

    resetUndoConfirmationClosingState();
    setPickToUndo(pick);
  }

  function closeUndoConfirmation() {
    if (undoingPickId) {
      return;
    }

    setPickToUndo(null);
  }

  async function confirmUndoPick() {
    if (!token || !pickToUndo || pickToUndo.isCancelled) {
      return;
    }

    setError("");
    setUndoingPickId(pickToUndo.pickId);

    try {
      await undoPick(token, pickToUndo.pickId);
      setPickToUndo(null);
      await loadPicks(picksPageNumber);
    } catch (apiError) {
      console.error(apiError);
      setError(
        apiError instanceof Error
          ? apiError.message
          : "No se ha podido deshacer el pick.",
      );
    } finally {
      setUndoingPickId(null);
    }
  }

  async function confirmResetSystem() {
    if (!token || !isAdmin) {
      return;
    }

    setError("");
    setIsResetting(true);

    try {
      await resetSystem(token);

      setIsResetConfirmationOpen(false);
      setIsPickHistoryOpen(false);
      setIsOrganizersOpen(false);
      closePickDisplay();
      setPickToUndo(null);

      setPicksPage(emptyPicksPage);
      setPicksPageNumber(1);
      setHasLoadedPicks(false);

      await loadStatus();

      openResetSuccess();
    } catch (apiError) {
      console.error(apiError);
      setError(
        apiError instanceof Error
          ? apiError.message
          : "No se ha podido reiniciar el evento.",
      );
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <>
      <section className="app-section system-page">
        <div className="section-heading">
          <div>
            <h2>Sistema</h2>
            <p>Controla el estado general del evento.</p>
          </div>
        </div>

        {error && <p className="app-error">{error}</p>}

        <div className="system-grid">
          <SystemActionCard
            kicker="Coordinadores"
            title="Coordinadores"
            description={
              canCreateCoordinators
                ? "Gestiona coordinadores y usuarios con permisos de organización."
                : "Consulta los coordinadores registrados en el evento."
            }
            buttonLabel="Gestionar"
            onClick={openOrganizers}
          />

          <SystemActionCard
            kicker="Historial"
            title="Historial de elecciones"
            description="Consulta las elecciones realizadas y deshaz selecciones si es necesario."
            buttonLabel="Ver historial"
            onClick={() => void openPickHistory()}
          />

          <SystemDraftStatusCard
            status={status}
            isLoading={isLoadingStatus}
            isSaving={isSavingStatus}
            onToggleDraft={handleToggleDraft}
            formatDateTime={formatDateTime}
          />

          <SystemActionCard
            kicker="Pantalla"
            title="Display de elecciones"
            description="Abre una ventana independiente para proyectar la última elección."
            buttonLabel="Abrir display"
            onClick={openPickDisplay}
          />

          {isAdmin && (
            <article className="system-card system-reset-card">
              <div>
                <p className="team-card-kicker">Zona peligrosa</p>
                <h3>Reiniciar evento</h3>
                <p>
                  Elimina usuarios no administradores, equipos, elecciones y
                  fotos asociadas. Esta acción no se puede deshacer.
                </p>
              </div>

              <button
                type="button"
                className="system-reset-button"
                onClick={openResetConfirmation}
                disabled={isResetting}
              >
                {isResetting ? "Reiniciando..." : "Reiniciar evento"}
              </button>
            </article>
          )}
        </div>
      </section>

      <PickHistoryModal
        isOpen={isPickHistoryOpen}
        isClosing={isPickHistoryClosing}
        picksPage={picksPage}
        isLoading={isLoadingPicks}
        undoingPickId={undoingPickId}
        onClose={closePickHistoryWithAnimation}
        onRefresh={() => void loadPicks(picksPageNumber)}
        onPageChange={(nextPage) => void loadPicks(nextPage)}
        onRequestUndo={requestUndoPick}
        formatDateTime={formatDateTime}
        getPickUserName={getPickUserName}
      />

      <UndoPickConfirmationModal
        pick={pickToUndo}
        isClosing={isUndoConfirmationClosing}
        isUndoing={Boolean(undoingPickId)}
        onClose={closeUndoConfirmationWithAnimation}
        onConfirm={() => void confirmUndoPick()}
        getPickUserName={getPickUserName}
      />

      <OrganizersModal
        isOpen={isOrganizersOpen}
        isClosing={isOrganizersClosing}
        token={token}
        canCreateCoordinators={canCreateCoordinators}
        onClose={closeOrganizersWithAnimation}
      />

      <PickDisplayWindow
        popupWindow={pickDisplayWindow}
        token={token}
        onClose={closePickDisplay}
      />

      <ResetEventConfirmationModal
        isOpen={isResetConfirmationOpen}
        isClosing={isResetConfirmationClosing}
        isResetting={isResetting}
        onClose={closeResetConfirmationWithAnimation}
        onConfirm={() => void confirmResetSystem()}
      />

      <ResetEventSuccessModal
        isOpen={isResetSuccessOpen}
        isClosing={isResetSuccessClosing}
        onClose={closeResetSuccessWithAnimation}
      />
    </>
  );
}

export default SystemPage;
