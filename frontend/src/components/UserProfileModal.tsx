import { createPortal } from 'react-dom'
import { useAnimatedModalClose } from '../hooks/useAnimatedModalClose'
import UserProfileContent, { type UserProfileModalData } from './UserProfileContent'

export type { UserProfileModalData } from './UserProfileContent'

type UserProfileModalProps = {
  user: UserProfileModalData
  title?: string
  canManage?: boolean
  showDangerActions?: boolean
  onClose: () => void
  onUserChanged: (userId: number) => Promise<void>
  onUserDeleted?: () => Promise<void> | void
  onBack?: () => void
  backLabel?: string
}

function UserProfileModal({
  user,
  title = 'Perfil de usuario',
  canManage = false,
  showDangerActions = false,
  onClose,
  onUserChanged,
  onUserDeleted,
  onBack,
  backLabel = 'Volver',
}: UserProfileModalProps) {
  const { isClosing, closeWithAnimation } = useAnimatedModalClose(onClose)

  return createPortal(
    <div
      className={`profile-modal-backdrop ${isClosing ? 'modal-closing' : ''}`}
      role="presentation"
      onClick={closeWithAnimation}
    >
      <section
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <UserProfileContent
          user={user}
          title={title}
          canManage={canManage}
          showDangerActions={showDangerActions}
          onClose={closeWithAnimation}
          onUserChanged={onUserChanged}
          onUserDeleted={onUserDeleted}
          onBack={onBack}
          backLabel={backLabel}
        />
      </section>
    </div>,
    document.body,
  )
}

export default UserProfileModal