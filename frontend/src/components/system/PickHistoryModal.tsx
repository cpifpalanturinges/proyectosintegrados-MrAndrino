import { createPortal } from "react-dom";
import PaginationControls from "../PaginationControls";
import type { PagedResult } from "../../types/paginationTypes";
import type { PickHistoryItem } from "../../types/pickHistoryTypes";

type PickHistoryModalProps = {
  isOpen: boolean;
  isClosing: boolean;
  picksPage: PagedResult<PickHistoryItem>;
  isLoading: boolean;
  undoingPickId: number | null;
  onClose: () => void;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
  onRequestUndo: (pick: PickHistoryItem) => void;
  formatDateTime: (value: string) => string;
  getPickUserName: (pick: PickHistoryItem) => string;
};

function PickHistoryModal({
  isOpen,
  isClosing,
  picksPage,
  isLoading,
  undoingPickId,
  onClose,
  onRefresh,
  onPageChange,
  onRequestUndo,
  formatDateTime,
  getPickUserName,
}: PickHistoryModalProps) {
  if (!isOpen) {
    return null;
  }

  const activePicksCount = picksPage.items.filter(
    (pick) => !pick.isCancelled,
  ).length;

  return createPortal(
    <div
      className={`system-modal-backdrop ${isClosing ? "modal-closing" : ""}`}
      role="presentation"
      onClick={onClose}
    >
      <section
        className="system-modal-panel system-picks-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Historial de picks"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="profile-modal-heading">
          <div>
            <p className="team-card-kicker">Historial</p>
            <h2>Elecciones realizadas</h2>
          </div>

          <button
            type="button"
            className="profile-modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
            disabled={Boolean(undoingPickId)}
          >
            ×
          </button>
        </div>

        <div className="system-modal-toolbar">
          <p>
            {picksPage.totalItems === 0
              ? "Todavía no hay elecciones registradas."
              : `${picksPage.totalItems} elecciones registradas · ${activePicksCount} activas en esta página`}
          </p>

          <button
            type="button"
            className="system-secondary-button"
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        {isLoading ? (
          <p className="app-muted">Cargando historial de elecciones...</p>
        ) : picksPage.items.length === 0 ? (
          <p className="app-muted">
            Todavía no se ha realizado ninguna elección.
          </p>
        ) : (
          <>
            <div className="system-picks-list">
              {picksPage.items.map((pick) => {
                const isUndoingThisPick = undoingPickId === pick.pickId;

                return (
                  <article
                    key={pick.pickId}
                    className={`system-pick-card ${
                      pick.isCancelled ? "system-pick-card-cancelled" : ""
                    }`}
                  >
                    <div className="system-pick-main">
                      <span className="system-pick-order">
                        #{pick.pickOrder}
                      </span>

                      <div>
                        <strong>{getPickUserName(pick)}</strong>
                        <p>{pick.teamName}</p>
                        <small>{formatDateTime(pick.createdAt)}</small>
                      </div>
                    </div>

                    <div className="system-pick-actions">
                      <span
                        className={`system-pick-status ${
                          pick.isCancelled
                            ? "system-pick-status-cancelled"
                            : ""
                        }`}
                      >
                        {pick.isCancelled ? "Cancelado" : "Activo"}
                      </span>

                      <button
                        type="button"
                        className="system-danger-button"
                        onClick={() => onRequestUndo(pick)}
                        disabled={pick.isCancelled || isUndoingThisPick}
                      >
                        {isUndoingThisPick ? "Deshaciendo..." : "Deshacer"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <PaginationControls
              pagination={picksPage}
              isLoading={isLoading}
              onPageChange={onPageChange}
            />
          </>
        )}
      </section>
    </div>,
    document.body,
  );
}

export default PickHistoryModal;
