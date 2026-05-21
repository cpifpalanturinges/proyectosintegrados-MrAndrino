import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/authApi";
import UserProfileModal from "../components/profile/UserProfileModal";
import DraftPage from "./app/DraftPage";
import MyTeamPage from "./app/MyTeamPage";
import SystemPage from "./app/SystemPage";
import TeamsPage from "./app/TeamsPage";
import UsersPage from "./app/UsersPage";
import type { CurrentUser } from "../types/authTypes";
import {
  clearAuthSession,
  getStoredUser,
  getToken,
  saveStoredUser,
} from "../utils/authStorage";
import { getPhotoUrl } from "../utils/photoUrl";
import { getRoleLabel } from "../utils/roleLabel";

type AppTab = "team" | "draft" | "teams" | "users" | "system";
type TabAnimationDirection = "next" | "previous";

const tabOrder: AppTab[] = ["team", "draft", "teams", "users", "system"];

function AppHomePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<CurrentUser | null>(() => getStoredUser());

  const isAdminArea = user?.role === "Admin" || user?.role === "Coordinator";
  const isLeader = user?.role === "Leader";
  const isParticipant = user?.role === "Participant";
  const canEditOwnProfile =
    user?.role === "Admin" || user?.role === "Coordinator";

  const initialTab: AppTab = isAdminArea ? "teams" : "team";

  const [activeTab, setActiveTab] = useState<AppTab>(initialTab);
  const [animationDirection, setAnimationDirection] =
    useState<TabAnimationDirection>("next");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const displayName = user?.firstName?.trim() || user?.username || "Usuario";

  function handleLogout() {
    clearAuthSession();
    navigate("/auth");
  }

  function handleTabChange(nextTab: AppTab) {
    if (nextTab === activeTab) {
      return;
    }

    const currentIndex = tabOrder.indexOf(activeTab);
    const nextIndex = tabOrder.indexOf(nextTab);

    setAnimationDirection(nextIndex > currentIndex ? "next" : "previous");
    setActiveTab(nextTab);
  }

  async function refreshOwnProfile() {
    const token = getToken();

    if (!token) {
      return;
    }

    const refreshedUser = await getCurrentUser(token);

    saveStoredUser(refreshedUser);
    setUser(refreshedUser);
  }

  return (
    <main className="app-page">
      <header className="app-header">
        <button
          type="button"
          className="app-user-summary"
          onClick={() => setIsProfileOpen(true)}
        >
          <img
            className="app-user-photo"
            src={getPhotoUrl(user?.photoPath)}
            alt={`Foto de ${displayName}`}
          />

          <span className="app-user-text">
            <span className="app-brand">TeamDraft</span>
            <span className="app-user-name">{displayName}</span>
            <span className="app-role">{getRoleLabel(user?.role)}</span>
            <span className="app-profile-hint">Ver perfil</span>
          </span>
        </button>

        <button
          type="button"
          className="app-logout-button"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </header>

      <nav className="app-tabs" aria-label="Navegación principal">
        {(isLeader || isParticipant) && (
          <button
            type="button"
            className={`app-tab ${activeTab === "team" ? "app-tab-active" : ""}`}
            onClick={() => handleTabChange("team")}
          >
            Mi equipo
          </button>
        )}

        {isLeader && (
          <button
            type="button"
            className={`app-tab ${activeTab === "draft" ? "app-tab-active" : ""}`}
            onClick={() => handleTabChange("draft")}
          >
            Elegir
          </button>
        )}

        {(isAdminArea || isLeader || isParticipant) && (
          <button
            type="button"
            className={`app-tab ${activeTab === "teams" ? "app-tab-active" : ""}`}
            onClick={() => handleTabChange("teams")}
          >
            Equipos
          </button>
        )}

        {isAdminArea && (
          <>
            <button
              type="button"
              className={`app-tab ${activeTab === "users" ? "app-tab-active" : ""}`}
              onClick={() => handleTabChange("users")}
            >
              Usuarios
            </button>

            <button
              type="button"
              className={`app-tab ${activeTab === "system" ? "app-tab-active" : ""}`}
              onClick={() => handleTabChange("system")}
            >
              Sistema
            </button>
          </>
        )}
      </nav>

      <div className="app-main-scroll">
        <section
          key={activeTab}
          className={`app-content app-content-${animationDirection}`}
        >
          {activeTab === "team" && (isLeader || isParticipant) && (
            <MyTeamPage />
          )}
          {activeTab === "draft" && isLeader && (
            <DraftPage onPickCompleted={() => handleTabChange("team")} />
          )}
          {activeTab === "teams" && <TeamsPage />}
          {activeTab === "users" && isAdminArea && <UsersPage />}
          {activeTab === "system" && isAdminArea && <SystemPage />}
        </section>
      </div>

      {isProfileOpen && user && (
        <UserProfileModal
          user={user}
          title="Mi perfil"
          canManage={canEditOwnProfile}
          showDangerActions={false}
          onClose={() => setIsProfileOpen(false)}
          onUserChanged={async () => {
            await refreshOwnProfile();
          }}
        />
      )}
    </main>
  );
}

export default AppHomePage;
