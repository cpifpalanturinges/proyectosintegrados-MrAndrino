import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getLatestActivePick } from "../../api/systemApi";
import diverxiaLogo from "../../assets/branding/diverxia-logo.png";
import type { PickHistoryItem } from "../../types/pickHistoryTypes";
import { getPhotoUrl } from "../../utils/photoUrl";

type PickDisplayWindowProps = {
  popupWindow: Window | null;
  token: string | null;
  onClose: () => void;
};

function getPickUserName(pick: PickHistoryItem) {
  return `${pick.firstName} ${pick.lastName}`.trim();
}

function copyCurrentStylesToPopup(popupWindow: Window) {
  const popupDocument = popupWindow.document;

  const existingCopiedStyles = popupDocument.head.querySelectorAll(
    "[data-teamdraft-style]",
  );
  existingCopiedStyles.forEach((styleNode) => styleNode.remove());

  const styleNodes = document.querySelectorAll('style, link[rel="stylesheet"]');

  styleNodes.forEach((node) => {
    const clonedNode = node.cloneNode(true) as HTMLElement;
    clonedNode.setAttribute("data-teamdraft-style", "true");
    popupDocument.head.appendChild(clonedNode);
  });
}

function PickDisplayWindow({
  popupWindow,
  token,
  onClose,
}: PickDisplayWindowProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastPickIdRef = useRef<number | null>(null);

  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [latestPick, setLatestPick] = useState<PickHistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!popupWindow) {
      return;
    }

    const popupDocument = popupWindow.document;

    popupDocument.title = "TeamDraft · Último pick";
    popupDocument.body.innerHTML = "";
    popupDocument.body.className = "pick-display-popup-body";

    copyCurrentStylesToPopup(popupWindow);

    const rootElement = popupDocument.createElement("div");
    rootElement.className = "pick-display-popup-root";

    popupDocument.body.appendChild(rootElement);

    containerRef.current = rootElement;
    setContainer(rootElement);

    function handleBeforeUnload() {
      onClose();
    }

    popupWindow.addEventListener("beforeunload", handleBeforeUnload);

    const closedChecker = window.setInterval(() => {
      if (popupWindow.closed) {
        window.clearInterval(closedChecker);
        onClose();
      }
    }, 800);

    return () => {
      popupWindow.removeEventListener("beforeunload", handleBeforeUnload);
      window.clearInterval(closedChecker);

      if (!popupWindow.closed) {
        rootElement.remove();
      }

      containerRef.current = null;
      setContainer(null);
    };
  }, [popupWindow, onClose]);

  useEffect(() => {
    if (!popupWindow || !container || !token) {
      return;
    }

    void loadLatestPick();

    const intervalId = window.setInterval(() => {
      void loadLatestPick({ silent: true });
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [popupWindow, container, token]);

  async function loadLatestPick(options: { silent?: boolean } = {}) {
    if (!token) {
      setError("Sesión no válida.");
      return;
    }

    setError("");

    if (options.silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await getLatestActivePick(token);

      if (data?.pickId !== lastPickIdRef.current) {
        lastPickIdRef.current = data?.pickId ?? null;
        setLatestPick(data);
      } else if (!data) {
        setLatestPick(null);
      }
    } catch (apiError) {
      console.error(apiError);
      setError("No se ha podido cargar el último pick.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  if (!popupWindow || !container) {
    return null;
  }

  return createPortal(
    <main className="pick-display-page">
      <header className="pick-display-header">
        <div>
          <p className="team-card-kicker">TeamDraft</p>
          <h1>Última elección</h1>
        </div>

        <button
          type="button"
          className="system-secondary-button pick-display-refresh"
          onClick={() => void loadLatestPick()}
          disabled={isLoading || isRefreshing}
        >
          {isLoading || isRefreshing ? "Actualizando..." : "Actualizar"}
        </button>
      </header>

      <img
        src={diverxiaLogo}
        alt="Diverxia"
        className="pick-display-logo-mark"
      />

      {error && <p className="app-error">{error}</p>}

      <section className="pick-display-stage">
        {isLoading && !latestPick ? (
          <div className="pick-display-empty">
            <p>Cargando último pick...</p>
          </div>
        ) : latestPick ? (
          <article className="pick-display-card">
            <p className="pick-display-team-line">
              El equipo <strong>{latestPick.teamName}</strong> ha elegido a:
            </p>

            <div className="pick-display-person-row">
              <div className="pick-display-photo-frame">
                <img
                  src={getPhotoUrl(latestPick.photoPath)}
                  alt={getPickUserName(latestPick)}
                  className="pick-display-photo"
                />
              </div>

              <h2>{getPickUserName(latestPick)}</h2>
            </div>
          </article>
        ) : (
          <div className="pick-display-empty">
            <p>Todavía no hay picks activos.</p>
            <span>Cuando un líder elija a alguien, aparecerá aquí.</span>
          </div>
        )}
      </section>
    </main>,
    container,
  );
}

export default PickDisplayWindow;
