import { getPhotoUrl } from '../utils/photoUrl'
import { getRoleLabel } from '../utils/roleLabel'

export type UserCardData = {
  userId: number
  firstName: string
  lastName: string
  photoPath?: string | null
  studies?: string | null
  skill1?: number | null
  skill2?: number | null
  skill3?: number | null
  skill4?: number | null
  username?: string | null
  role?: string | null
  assignedTeamName?: string | null
  pickOrder?: number | null
}

type UserCardVariant = 'default' | 'compact' | 'profile'

type UserCardProps = {
  user: UserCardData
  showPickOrder?: boolean
  showRole?: boolean
  showUsername?: boolean
  showTeam?: boolean
  showSkills?: boolean
  clickable?: boolean
  onClick?: () => void
  variant?: UserCardVariant
}

function clampSkillValue(value?: number | null) {
  if (value == null) {
    return 0
  }

  return Math.max(0, Math.min(value, 5))
}

function UserCard({
  user,
  showPickOrder = false,
  showRole = false,
  showUsername = false,
  showTeam = false,
  showSkills = true,
  clickable = false,
  onClick,
  variant = 'default',
}: UserCardProps) {
  const fullName = `${user.firstName} ${user.lastName}`.trim()

  const skills = [
    { label: 'Skill 1', value: user.skill1 },
    { label: 'Skill 2', value: user.skill2 },
    { label: 'Skill 3', value: user.skill3 },
    { label: 'Skill 4', value: user.skill4 },
  ]

  const className = [
    'user-card',
    `user-card--${variant}`,
    clickable ? 'user-card--clickable' : '',
    !showSkills ? 'user-card--without-skills' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      <div className="user-card-header">
        <img className="user-card-photo" src={getPhotoUrl(user.photoPath)} alt={fullName} />

        <div className="user-card-title">
          <h4>{fullName || 'Usuario sin nombre'}</h4>

          {user.studies && <p className="user-card-studies">{user.studies}</p>}

          <div className="user-card-meta">
            {showPickOrder && user.pickOrder != null && <span>Pick #{user.pickOrder}</span>}
            {showRole && user.role && <span>{getRoleLabel(user.role)}</span>}
            {showUsername && user.username && <span>@{user.username}</span>}
            {showTeam && user.assignedTeamName && <span>{user.assignedTeamName}</span>}
          </div>
        </div>
      </div>

      {showSkills && (
        <div className="user-card-skills">
          {skills.map((skill) => {
            const skillValue = clampSkillValue(skill.value)
            const percentage = skillValue * 20

            return (
              <div className="user-card-skill" key={skill.label}>
                <div className="user-card-skill-header">
                  <span>{skill.label}</span>
                  <strong>{skill.value ?? '-'}</strong>
                </div>

                <div className="user-card-skill-track">
                  <span style={{ width: `${percentage}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )

  if (clickable) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {content}
      </button>
    )
  }

  return <article className={className}>{content}</article>
}

export default UserCard