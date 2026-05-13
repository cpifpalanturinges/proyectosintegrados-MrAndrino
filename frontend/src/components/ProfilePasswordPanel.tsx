import { useState } from 'react'

type ProfilePasswordPanelProps = {
  isSaving: boolean
  onSave: (newPassword: string) => void
  onCancel: () => void
}

function ProfilePasswordPanel({ isSaving, onSave, onCancel }: ProfilePasswordPanelProps) {
  const [newPassword, setNewPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [localError, setLocalError] = useState('')

  function handleSave() {
    if (!newPassword.trim()) {
      setLocalError('La nueva contraseña es obligatoria.')
      return
    }

    if (newPassword.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (newPassword !== repeatPassword) {
      setLocalError('Las contraseñas no coinciden.')
      return
    }

    setLocalError('')
    onSave(newPassword)
  }

  return (
    <form className="profile-password-panel" onSubmit={(event) => event.preventDefault()}>
      <p className="profile-password-text">
        Introduce la nueva contraseña para actualizar el acceso de este usuario.
      </p>

      {localError && <p className="app-error">{localError}</p>}

      <label className="profile-form-field">
        Nueva contraseña
        <input
          type="password"
          value={newPassword}
          autoComplete="new-password"
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </label>

      <label className="profile-form-field">
        Repetir contraseña
        <input
          type="password"
          value={repeatPassword}
          autoComplete="new-password"
          onChange={(event) => setRepeatPassword(event.target.value)}
        />
      </label>

      <div className="profile-form-actions">
        <button
          type="button"
          className="profile-save-button"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : 'Guardar contraseña'}
        </button>

        <button
          type="button"
          className="profile-cancel-button"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default ProfilePasswordPanel