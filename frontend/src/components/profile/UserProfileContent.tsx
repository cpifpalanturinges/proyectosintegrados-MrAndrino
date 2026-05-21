import { useEffect, useState } from "react";
import { undoPick } from "../../api/adminPickApi";
import {
  deleteUser,
  resetUserPhoto,
  updateUser,
  updateUserPassword,
  updateUserPhoto,
} from "../../api/adminUserApi";
import { skillLabels } from "../../utils/skillLabels";
import { getToken } from "../../utils/authStorage";
import UserCard from "../users/UserCard";
import ProfileActions from "./ProfileActions";
import ProfilePasswordPanel from "./ProfilePasswordPanel";
import ProfilePhotoPanel from "./ProfilePhotoPanel";

export type UserProfileModalData = {
  userId: number;
  username: string;
  role: string;
  firstName: string;
  lastName: string;
  photoPath?: string | null;
  studies?: string | null;
  skill1?: number | null;
  skill2?: number | null;
  skill3?: number | null;
  skill4?: number | null;
  assignedTeamId?: number | null;
  assignedTeamName?: string | null;
  pickId?: number | null;
};

type ProfilePanel = "profile" | "edit" | "photo" | "password" | "confirmation";
type ProfilePanelDirection = "forward" | "back";

type ProfileFormState = {
  firstName: string;
  lastName: string;
  studies: string;
  skill1: string;
  skill2: string;
  skill3: string;
  skill4: string;
};

type ConfirmationState =
  | {
      type: "remove-from-team";
      title: string;
      message: string;
      confirmLabel: string;
    }
  | {
      type: "delete-user";
      title: string;
      message: string;
      confirmLabel: string;
    }
  | null;

type UserProfileContentProps = {
  user: UserProfileModalData;
  title?: string;
  canManage?: boolean;
  showDangerActions?: boolean;
  onClose: () => void;
  onUserChanged: (userId: number) => Promise<void>;
  onUserDeleted?: () => Promise<void> | void;
  onBack?: () => void;
  backLabel?: string;
};

function createProfileFormState(user: UserProfileModalData): ProfileFormState {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    studies: user.studies ?? "",
    skill1: user.skill1?.toString() ?? "",
    skill2: user.skill2?.toString() ?? "",
    skill3: user.skill3?.toString() ?? "",
    skill4: user.skill4?.toString() ?? "",
  };
}

function parseSkillValue(value: string) {
  if (value === "") {
    return null;
  }

  return Number(value);
}

function UserProfileContent({
  user,
  title = "Perfil de usuario",
  canManage = false,
  showDangerActions = false,
  onClose,
  onUserChanged,
  onUserDeleted,
  onBack,
  backLabel = "Volver",
}: UserProfileContentProps) {
  const [activePanel, setActivePanel] = useState<ProfilePanel>("profile");
  const [panelDirection, setPanelDirection] =
    useState<ProfilePanelDirection>("forward");

  const [profileForm, setProfileForm] = useState<ProfileFormState>(() =>
    createProfileFormState(user),
  );

  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isRemovingFromTeam, setIsRemovingFromTeam] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationState>(null);

  const canRemoveFromTeam = Boolean(user.pickId) && user.role !== "Leader";
  const canDeleteUser = true;
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  useEffect(() => {
    setProfileForm(createProfileFormState(user));
    setProfileError("");
    setConfirmation(null);
    setPanelDirection("forward");
    setActivePanel("profile");
  }, [user.userId]);

  function openPanel(panel: ProfilePanel) {
    setProfileError("");
    setPanelDirection("forward");
    setActivePanel(panel);
  }

  function backToProfile() {
    setProfileError("");
    setConfirmation(null);
    setPanelDirection("back");
    setActivePanel("profile");
  }

  function updateProfileField(field: keyof ProfileFormState, value: string) {
    setProfileForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSaveProfile() {
    const token = getToken();

    if (!token) {
      setProfileError("Sesión no válida.");
      return;
    }

    if (!profileForm.firstName.trim()) {
      setProfileError("El nombre es obligatorio.");
      return;
    }

    if (!profileForm.lastName.trim()) {
      setProfileError("Los apellidos son obligatorios.");
      return;
    }

    setProfileError("");
    setIsSavingProfile(true);

    try {
      await updateUser(
        user.userId,
        {
          firstName: profileForm.firstName.trim(),
          lastName: profileForm.lastName.trim(),
          studies: profileForm.studies.trim() || null,
          skill1: parseSkillValue(profileForm.skill1),
          skill2: parseSkillValue(profileForm.skill2),
          skill3: parseSkillValue(profileForm.skill3),
          skill4: parseSkillValue(profileForm.skill4),
        },
        token,
      );

      await onUserChanged(user.userId);
      backToProfile();
    } catch (error) {
      console.error(error);
      setProfileError(
        error instanceof Error
          ? error.message
          : "No se ha podido actualizar el perfil.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleChangeProfilePhoto(photo: File) {
    const token = getToken();

    if (!token) {
      setProfileError("Sesión no válida.");
      return;
    }

    setProfileError("");
    setIsSavingPhoto(true);

    try {
      await updateUserPhoto(user.userId, photo, token);
      await onUserChanged(user.userId);
      backToProfile();
    } catch (error) {
      console.error(error);
      setProfileError(
        error instanceof Error
          ? error.message
          : "No se ha podido cambiar la imagen.",
      );
    } finally {
      setIsSavingPhoto(false);
    }
  }

  async function handleDeleteProfilePhoto() {
    const token = getToken();

    if (!token) {
      setProfileError("Sesión no válida.");
      return;
    }

    setProfileError("");
    setIsSavingPhoto(true);

    try {
      await resetUserPhoto(user.userId, token);
      await onUserChanged(user.userId);
      backToProfile();
    } catch (error) {
      console.error(error);
      setProfileError(
        error instanceof Error
          ? error.message
          : "No se ha podido borrar la imagen.",
      );
    } finally {
      setIsSavingPhoto(false);
    }
  }

  async function handleChangePassword(newPassword: string) {
    const token = getToken();

    if (!token) {
      setProfileError("Sesión no válida.");
      return;
    }

    setProfileError("");
    setIsSavingPassword(true);

    try {
      await updateUserPassword(user.userId, { newPassword }, token);
      backToProfile();
    } catch (error) {
      console.error(error);
      setProfileError(
        error instanceof Error
          ? error.message
          : "No se ha podido cambiar la contraseña.",
      );
    } finally {
      setIsSavingPassword(false);
    }
  }

  function requestRemoveFromTeam() {
    if (!canRemoveFromTeam) {
      return;
    }

    setConfirmation({
      type: "remove-from-team",
      title: "Expulsar del equipo",
      message: `¿Seguro que quieres expulsar a ${fullName} de su equipo? El usuario volverá a estar disponible para el draft.`,
      confirmLabel: "Expulsar",
    });

    openPanel("confirmation");
  }

  function requestDeleteUser() {
    setConfirmation({
      type: "delete-user",
      title: "Eliminar usuario",
      message: `¿Seguro que quieres eliminar a ${fullName}? Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
    });

    openPanel("confirmation");
  }

  async function confirmCurrentAction() {
    if (!confirmation) {
      return;
    }

    if (confirmation.type === "remove-from-team") {
      await handleRemoveFromTeam();
      return;
    }

    if (confirmation.type === "delete-user") {
      await handleDeleteUser();
    }
  }

  async function handleRemoveFromTeam() {
    const token = getToken();

    if (!token || !user.pickId) {
      return;
    }

    setProfileError("");
    setIsRemovingFromTeam(true);

    try {
      await undoPick(user.pickId, token);
      await onUserChanged(user.userId);
      backToProfile();
    } catch (error) {
      console.error(error);
      setProfileError(
        error instanceof Error
          ? error.message
          : "No se ha podido expulsar del equipo.",
      );
    } finally {
      setIsRemovingFromTeam(false);
    }
  }

  async function handleDeleteUser() {
    const token = getToken();

    if (!token) {
      setProfileError("Sesión no válida.");
      return;
    }

    setProfileError("");
    setIsDeletingUser(true);

    try {
      await deleteUser(user.userId, token);
      setConfirmation(null);
      await onUserDeleted?.();
      onClose();
    } catch (error) {
      console.error(error);
      setProfileError(
        error instanceof Error
          ? error.message
          : "No se ha podido eliminar el usuario.",
      );
    } finally {
      setIsDeletingUser(false);
    }
  }

  const panelTitle =
    activePanel === "edit"
      ? "Editar perfil"
      : activePanel === "photo"
        ? "Imagen de perfil"
        : activePanel === "password"
          ? "Cambiar contraseña"
          : activePanel === "confirmation" && confirmation
            ? confirmation.title
            : title;

  const panelKey =
    activePanel === "confirmation" && confirmation
      ? `${activePanel}-${confirmation.type}`
      : activePanel;

  const isConfirmingAction = isRemovingFromTeam || isDeletingUser;

  return (
    <div
      key={panelKey}
      className={`profile-content-view profile-content-view-${panelDirection}`}
    >
      <div className="profile-modal-heading">
        <div>
          {onBack && activePanel === "profile" && (
            <button
              type="button"
              className="profile-back-button"
              onClick={onBack}
            >
              ← {backLabel}
            </button>
          )}

          <h2>{panelTitle}</h2>
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

      {profileError && <p className="app-error">{profileError}</p>}

      {activePanel === "profile" && (
        <>
          <UserCard
            user={user}
            variant="profile"
            showUsername
            showRole
            showTeam
          />

          {canManage && (
            <ProfileActions
              mode={showDangerActions ? "managed" : "own"}
              canRemoveFromTeam={canRemoveFromTeam && !isRemovingFromTeam}
              canDeleteUser={canDeleteUser && !isDeletingUser}
              onChangePhoto={() => openPanel("photo")}
              onEditProfile={() => {
                setProfileForm(createProfileFormState(user));
                openPanel("edit");
              }}
              onChangePassword={() => openPanel("password")}
              onRemoveFromTeam={requestRemoveFromTeam}
              onDeleteUser={requestDeleteUser}
            />
          )}
        </>
      )}

      {activePanel === "edit" && (
        <form
          className="profile-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="profile-form-grid">
            <label className="profile-form-field">
              Nombre
              <input
                type="text"
                value={profileForm.firstName}
                onChange={(event) =>
                  updateProfileField("firstName", event.target.value)
                }
              />
            </label>

            <label className="profile-form-field">
              Apellidos
              <input
                type="text"
                value={profileForm.lastName}
                onChange={(event) =>
                  updateProfileField("lastName", event.target.value)
                }
              />
            </label>

            <label className="profile-form-field profile-form-field--full">
              Estudios
              <input
                type="text"
                value={profileForm.studies}
                onChange={(event) =>
                  updateProfileField("studies", event.target.value)
                }
              />
            </label>

            <label className="profile-form-field">
              {skillLabels.skill1}
              <input
                type="number"
                min="1"
                max="5"
                value={profileForm.skill1}
                onChange={(event) =>
                  updateProfileField("skill1", event.target.value)
                }
              />
            </label>

            <label className="profile-form-field">
              {skillLabels.skill2}
              <input
                type="number"
                min="1"
                max="5"
                value={profileForm.skill2}
                onChange={(event) =>
                  updateProfileField("skill2", event.target.value)
                }
              />
            </label>

            <label className="profile-form-field">
              {skillLabels.skill3}
              <input
                type="number"
                min="1"
                max="5"
                value={profileForm.skill3}
                onChange={(event) =>
                  updateProfileField("skill3", event.target.value)
                }
              />
            </label>

            <label className="profile-form-field">
              {skillLabels.skill4}
              <input
                type="number"
                min="1"
                max="5"
                value={profileForm.skill4}
                onChange={(event) =>
                  updateProfileField("skill4", event.target.value)
                }
              />
            </label>
          </div>

          <div className="profile-form-actions">
            <button
              type="button"
              className="profile-save-button"
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
            >
              {isSavingProfile ? "Guardando..." : "Guardar cambios"}
            </button>

            <button
              type="button"
              className="profile-cancel-button"
              onClick={() => {
                setProfileForm(createProfileFormState(user));
                backToProfile();
              }}
              disabled={isSavingProfile}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {activePanel === "photo" && (
        <ProfilePhotoPanel
          isSaving={isSavingPhoto}
          onChangePhoto={handleChangeProfilePhoto}
          onDeletePhoto={handleDeleteProfilePhoto}
          onCancel={backToProfile}
        />
      )}

      {activePanel === "password" && (
        <ProfilePasswordPanel
          isSaving={isSavingPassword}
          onSave={handleChangePassword}
          onCancel={backToProfile}
        />
      )}

      {activePanel === "confirmation" && confirmation && (
        <div className="profile-confirmation-inline">
          <div className="profile-confirmation-card">
            <p className="profile-confirmation-message">
              {confirmation.message}
            </p>

            <div className="profile-confirmation-actions">
              <button
                type="button"
                className="profile-confirmation-danger"
                onClick={confirmCurrentAction}
                disabled={isConfirmingAction}
              >
                {isConfirmingAction
                  ? "Procesando..."
                  : confirmation.confirmLabel}
              </button>

              <button
                type="button"
                className="profile-confirmation-cancel"
                onClick={backToProfile}
                disabled={isConfirmingAction}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfileContent;
