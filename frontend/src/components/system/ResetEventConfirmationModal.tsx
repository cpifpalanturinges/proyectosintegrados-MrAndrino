import { createPortal } from "react-dom";

type ResetEventConfirmationModalProps = {
  isOpen: boolean;
  isClosing: boolean;
  isResetting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function ResetEventConfirmationModal({
  isOpen,
  isClosing,
  isResetting,
  onClose,
  onConfirm,
}: ResetEventConfirmationModalProps) {
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
        className="system-modal-panel system-confirmation-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Confirmar reinicio del evento"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="profile-modal-heading">
          <div>
            <p className="team-card-kicker">Reiniciar evento</p>
            <h2>Confirmar reinicio</h2>
          </div>

          <button
            type="button"
            className="profile-modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
            disabled={isResetting}
          >
            ×
          </button>
        </div>

        <div className="system-confirmation-copy">
          <p>
            Esta acción eliminará participantes, líderes, coordinadores,
            equipos, elecciones y fotos asociadas.
          </p>

          <p>
            Los administradores se conservarán y el draft volverá a estar
            pausado.
          </p>

          <p>
            <strong>No se puede deshacer.</strong>
          </p>
        </div>

        <div className="profile-form-actions">
          <button
            type="button"
            className="profile-confirmation-danger"
            onClick={onConfirm}
            disabled={isResetting}
          >
            {isResetting ? "Reiniciando..." : "Reiniciar evento"}
          </button>

          <button
            type="button"
            className="profile-confirmation-cancel"
            onClick={onClose}
            disabled={isResetting}
          >
            Cancelar
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}

export default ResetEventConfirmationModal;
