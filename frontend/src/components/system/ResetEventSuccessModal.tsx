import { createPortal } from "react-dom";

type ResetEventSuccessModalProps = {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
};

function ResetEventSuccessModal({
  isOpen,
  isClosing,
  onClose,
}: ResetEventSuccessModalProps) {
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
        className="system-modal-panel system-success-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Evento reiniciado correctamente"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="profile-modal-heading">
          <div>
            <p className="team-card-kicker">Todo listo</p>
            <h2>Evento reiniciado</h2>
          </div>

          <button
            type="button"
            className="profile-modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        <div className="system-confirmation-copy">
          <p>
            Se han eliminado los datos del evento: participantes, líderes,
            coordinadores, equipos, picks y fotos asociadas.
          </p>

          <p>
            Los administradores se han conservado y el draft se ha vuelto a
            pausar.
          </p>
        </div>

        <button type="button" className="profile-save-button" onClick={onClose}>
          Entendido
        </button>
      </section>
    </div>,
    document.body,
  );
}

export default ResetEventSuccessModal;
