import { useRef } from 'react'

type ProfilePhotoPanelProps = {
  isSaving: boolean
  onChangePhoto: (photo: File) => void
  onDeletePhoto: () => void
  onCancel: () => void
}

function ProfilePhotoPanel({
  isSaving,
  onChangePhoto,
  onDeletePhoto,
  onCancel,
}: ProfilePhotoPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    onChangePhoto(file)
    event.target.value = ''
  }

  return (
    <div className="profile-photo-panel">
      <p className="profile-photo-panel-text">¿Qué quieres hacer con la imagen de perfil?</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="profile-photo-input"
        onChange={handleFileChange}
      />

      <div className="profile-photo-actions">
        <button
          type="button"
          className="profile-photo-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSaving}
        >
          Cambiar imagen
        </button>

        <button
          type="button"
          className="profile-photo-danger"
          onClick={onDeletePhoto}
          disabled={isSaving}
        >
          Borrar imagen
        </button>

        <button
          type="button"
          className="profile-photo-secondary"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default ProfilePhotoPanel