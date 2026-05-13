type ProfileActionsMode = 'own' | 'managed'

type ProfileActionsProps = {
  mode: ProfileActionsMode

  onChangePhoto: () => void
  onEditProfile: () => void
  onChangePassword: () => void

  onRemoveFromTeam?: () => void
  onDeleteUser?: () => void

  canRemoveFromTeam?: boolean
  canDeleteUser?: boolean
}

function ProfileActions({
  mode,
  onChangePhoto,
  onEditProfile,
  onChangePassword,
  onRemoveFromTeam,
  onDeleteUser,
  canRemoveFromTeam = false,
  canDeleteUser = false,
}: ProfileActionsProps) {
  const isManagedProfile = mode === 'managed'

  return (
    <div className="profile-actions">
      <div className="profile-actions-main">
        <button type="button" className="profile-action-button" onClick={onChangePhoto}>
          Cambiar imagen
        </button>

        <button type="button" className="profile-action-button" onClick={onEditProfile}>
          Editar perfil
        </button>

        <button type="button" className="profile-action-button" onClick={onChangePassword}>
          Cambiar contraseña
        </button>
      </div>

      {isManagedProfile && (
        <div className="profile-actions-danger">
          <button
            type="button"
            className="profile-danger-button"
            onClick={onRemoveFromTeam}
            disabled={!canRemoveFromTeam}
            title={
              canRemoveFromTeam
                ? 'Expulsar usuario del equipo'
                : 'Este usuario no se puede expulsar del equipo'
            }
          >
            Expulsar del equipo
          </button>

          <button
            type="button"
            className="profile-danger-button"
            onClick={onDeleteUser}
            disabled={!canDeleteUser}
          >
            Eliminar usuario
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileActions