import { createPortal } from "react-dom";
import type { PickHistoryItem } from "../../types/pickHistoryTypes";

type UndoPickConfirmationModalProps = {
  pick: PickHistoryItem | null;
  isClosing: boolean;
  isUndoing: boolean;
  onClose: () => void;
  onConfirm: () => void;
  getPickUserName: (pick: PickHistoryItem) => string;
};

function UndoPickConfirmationModal({
  pick,
  isClosing,
  isUndoing,
  onClose,
  onConfirm,
  getPickUserName,
}: UndoPickConfirmationModalProps) {
  if (!pick) {
    return null;
  }

  return createPortal(
    <div
      className={`system-modal-backdrop ${isClosing ? "modal-closing" : ""}`}
      role="presentation"
      onClick={onClose}
    >
      <section
        className="system-modal-panel system-confirmation-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Confirmar deshacer pick"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="profile-modal-heading">
          <div>
            <p className="team-card-kicker">Deshacer elección</p>
            <h2>Confirmar acción</h2>
          </div>

          <button
            type="button"
            className="profile-modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
            disabled={isUndoing}
          >
            ×
          </button>
        </div>

        <div className="system-confirmation-copy">
          <p>
            ¿Seguro que quieres deshacer la elección de{" "}
            <strong>{getPickUserName(pick)}</strong>?
          </p>

          <p>
            El participante volverá a estar disponible para el draft y la
            elección quedará marcada como cancelada en el historial.
          </p>
        </div>

        <div className="profile-form-actions">
          <button
            type="button"
            className="profile-confirmation-danger"
            onClick={onConfirm}
            disabled={isUndoing}
          >
            {isUndoing ? "Deshaciendo..." : "Deshacer elección"}
          </button>

          <button
            type="button"
            className="profile-confirmation-cancel"
            onClick={onClose}
            disabled={isUndoing}
          >
            Cancelar
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}

export default UndoPickConfirmationModal;
