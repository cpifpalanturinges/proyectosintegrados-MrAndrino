import type { SystemStatus } from "../../types/systemTypes";

type SystemDraftStatusCardProps = {
  status: SystemStatus | null;
  isLoading: boolean;
  isSaving: boolean;
  onToggleDraft: () => void;
  formatDateTime: (value: string) => string;
};

function SystemDraftStatusCard({
  status,
  isLoading,
  isSaving,
  onToggleDraft,
  formatDateTime,
}: SystemDraftStatusCardProps) {
  const isDraftOpen = status?.isDraftOpen ?? false;

  return (
    <article className="system-card system-card-featured">
      {isLoading ? (
        <p className="app-muted">Cargando estado del draft...</p>
      ) : status ? (
        <>
          <div>
            <p className="team-card-kicker">Estado del draft</p>

            <h3
              className={
                isDraftOpen ? "system-status-open" : "system-status-closed"
              }
            >
              {isDraftOpen ? "Draft abierto" : "Draft pausado"}
            </h3>

            <p>
              {isDraftOpen
                ? "Los líderes pueden elegir participantes."
                : "Los líderes no pueden elegir ahora mismo."}
            </p>

            <span>
              Última actualización: {formatDateTime(status.updatedAt)}
            </span>
          </div>

          <button
            type="button"
            className={`system-draft-toggle ${
              isDraftOpen
                ? "system-draft-toggle-pause"
                : "system-draft-toggle-open"
            }`}
            onClick={onToggleDraft}
            disabled={isSaving}
          >
            {isSaving
              ? "Actualizando..."
              : isDraftOpen
                ? "Pausar draft"
                : "Comenzar draft"}
          </button>
        </>
      ) : null}
    </article>
  );
}

export default SystemDraftStatusCard;
