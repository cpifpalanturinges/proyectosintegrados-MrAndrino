import { useState, type FormEvent, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../api/authApi'
import { saveAuthSession } from '../utils/authStorage'
import AuthCarousel from '../components/AuthCarousel'

type AuthMode = 'login' | 'register'

type RegisterField =
  | 'username'
  | 'firstName'
  | 'lastName'
  | 'password'
  | 'photo'
  | 'studies'
  | 'teamName'

type RegisterFieldErrors = Partial<Record<RegisterField, string>>

function AuthPage() {
  const navigate = useNavigate()

  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [isRegisterClosing, setIsRegisterClosing] = useState(false)
  const [isLeader, setIsLeader] = useState(false)

  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoginLoading, setIsLoginLoading] = useState(false)

  const [registerError, setRegisterError] = useState('')
  const [registerFieldErrors, setRegisterFieldErrors] = useState<RegisterFieldErrors>({})
  const [isRegisterLoading, setIsRegisterLoading] = useState(false)

  const isRegisterMode = authMode === 'register'
  const shouldShowRegisterContent = isRegisterMode || isRegisterClosing

  function openRegisterPanel() {
    setIsRegisterClosing(false)
    setAuthMode('register')
  }

  function closeRegisterPanel() {
    if (!isRegisterMode || isRegisterClosing) {
      return
    }

    setIsRegisterClosing(true)
    setAuthMode('login')

    window.setTimeout(() => {
      setIsRegisterClosing(false)
    }, 450)
  }

  function stopPanelClick(event: MouseEvent<HTMLElement>) {
    event.stopPropagation()
  }

  function scrollToRegisterField(fieldName: RegisterField) {
    window.setTimeout(() => {
      const field = document.querySelector<HTMLElement>(`[name="${fieldName}"]`)

      field?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })

      field?.focus()
    }, 50)
  }

  function setRegisterFieldError(fieldName: RegisterField, message: string) {
    setRegisterFieldErrors({
      [fieldName]: message,
    })

    setRegisterError('')
    setIsRegisterLoading(false)
    scrollToRegisterField(fieldName)
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoginError('')
    setIsLoginLoading(true)

    try {
      const authResponse = await login({
        username: loginUsername,
        password: loginPassword,
      })

      saveAuthSession(authResponse)
      navigate('/app')
    } catch (error) {
      console.error(error)
      setLoginError('No se ha podido iniciar sesión.')
    } finally {
      setIsLoginLoading(false)
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setRegisterError('')
    setRegisterFieldErrors({})
    setIsRegisterLoading(true)

    const form = event.currentTarget
    const formData = new FormData(form)

    const username = String(formData.get('username') ?? '').trim()
    const firstName = String(formData.get('firstName') ?? '').trim()
    const lastName = String(formData.get('lastName') ?? '').trim()
    const password = String(formData.get('password') ?? '').trim()
    const studies = String(formData.get('studies') ?? '').trim()
    const photo = formData.get('photo')

    if (!username) {
      setRegisterFieldError('username', 'El usuario es obligatorio.')
      return
    }

    if (username.length < 3) {
      setRegisterFieldError('username', 'El usuario debe tener al menos 3 caracteres.')
      return
    }

    if (!firstName) {
      setRegisterFieldError('firstName', 'El nombre es obligatorio.')
      return
    }

    if (!lastName) {
      setRegisterFieldError('lastName', 'Los apellidos son obligatorios.')
      return
    }

    if (!password) {
      setRegisterFieldError('password', 'La contraseña es obligatoria.')
      return
    }

    if (password.length < 6) {
      setRegisterFieldError('password', 'La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (!(photo instanceof File) || photo.size === 0) {
      setRegisterFieldError('photo', 'La foto es obligatoria.')
      return
    }

    if (!studies) {
      setRegisterFieldError('studies', 'Los estudios son obligatorios.')
      return
    }

    if (isLeader) {
      const teamName = String(formData.get('teamName') ?? '').trim()

      if (!teamName) {
        setRegisterFieldError('teamName', 'Si eres líder, debes indicar el nombre del equipo.')
        return
      }
    } else {
      formData.delete('teamName')
    }

    formData.set('username', username)
    formData.set('firstName', firstName)
    formData.set('lastName', lastName)
    formData.set('password', password)
    formData.set('studies', studies)
    formData.set('isLeader', String(isLeader))

    try {
      const authResponse = await register(formData)

      saveAuthSession(authResponse)
      navigate('/app')
    } catch (error) {
      console.error(error)

      if (error instanceof Error) {
        const message = error.message.toLowerCase()

        if (
          message.includes('usuario') ||
          message.includes('username') ||
          message.includes('user')
        ) {
          setRegisterFieldError('username', 'Ese nombre de usuario no está disponible.')
          return
        }

        if (message.includes('contraseña') || message.includes('password')) {
          setRegisterFieldError('password', 'La contraseña no cumple los requisitos.')
          return
        }

        if (message.includes('foto') || message.includes('photo')) {
          setRegisterFieldError('photo', 'La foto es obligatoria.')
          return
        }

        if (message.includes('equipo') || message.includes('team')) {
          setRegisterFieldError('teamName', 'Revisa el nombre del equipo.')
          return
        }

        setRegisterError(error.message)
      } else {
        setRegisterError('No se ha podido completar el registro.')
      }
    } finally {
      setIsRegisterLoading(false)
    }
  }

  return (
    <main
      className={`auth-page ${shouldShowRegisterContent ? 'auth-page-register' : ''}`}
      onClick={closeRegisterPanel}
    >
      <section className="auth-shell">
        <div className="auth-header">
          <div className="auth-brand">
            <span className="auth-brand-mark">X</span>
            <span>Diverxia</span>
          </div>

          <h1>
            Team<span>Draft</span>
          </h1>

          <div className="auth-divider" />

          <p>
            Forma tu equipo. <span>Haz tu pick.</span>
          </p>
        </div>

        <section className={`auth-login-panel ${shouldShowRegisterContent ? 'auth-login-hidden' : ''}`}>
          <div className="auth-panel-header">
            <h2>Iniciar sesión</h2>
            <p>Accede para gestionar tu equipo o continuar el draft.</p>
          </div>

          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <label>
              Usuario
              <input
                type="text"
                name="loginUsername"
                autoComplete="username"
                value={loginUsername}
                onChange={(event) => setLoginUsername(event.target.value)}
                required
              />
            </label>

            <label>
              Contraseña
              <input
                type="password"
                name="loginPassword"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                required
              />
            </label>

            {loginError && <p className="form-error">{loginError}</p>}

            <button type="submit" className="primary-button" disabled={isLoginLoading}>
              {isLoginLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </section>

        <AuthCarousel />
        
        <section
          className={`auth-register-panel ${
            isRegisterMode ? 'auth-register-open' : ''
          } ${isRegisterClosing ? 'auth-register-closing' : ''}`}
          onClick={stopPanelClick}
        >
          {!shouldShowRegisterContent && (
            <button
              type="button"
              className="auth-switch-button"
              onClick={openRegisterPanel}
            >
              <span>¿No tienes cuenta?</span>
              <strong>Registrarse</strong>
            </button>
          )}

          {shouldShowRegisterContent && (
            <div className="auth-register-content">
              <div className="auth-panel-header">
                <h2>Registrarse</h2>
                <p>Crea tu perfil para participar en el hackatón.</p>
              </div>

              <form className="auth-form" onSubmit={handleRegisterSubmit}>
                <label>
                  Usuario
                  <input type="text" name="username" autoComplete="username" required />
                  {registerFieldErrors.username && (
                    <span className="field-error">{registerFieldErrors.username}</span>
                  )}
                </label>

                <label>
                  Nombre
                  <input type="text" name="firstName" autoComplete="given-name" required />
                  {registerFieldErrors.firstName && (
                    <span className="field-error">{registerFieldErrors.firstName}</span>
                  )}
                </label>

                <label>
                  Apellidos
                  <input type="text" name="lastName" autoComplete="family-name" required />
                  {registerFieldErrors.lastName && (
                    <span className="field-error">{registerFieldErrors.lastName}</span>
                  )}
                </label>

                <label>
                  Contraseña
                  <input type="password" name="password" autoComplete="new-password" required />
                  {registerFieldErrors.password && (
                    <span className="field-error">{registerFieldErrors.password}</span>
                  )}
                </label>

                <label>
                  Foto
                  <input type="file" name="photo" accept="image/*" capture="user" required />
                  {registerFieldErrors.photo && (
                    <span className="field-error">{registerFieldErrors.photo}</span>
                  )}
                </label>

                <label>
                  Estudios
                  <input
                    type="text"
                    name="studies"
                    placeholder="DAW, DAM, Marketing..."
                    required
                  />
                  {registerFieldErrors.studies && (
                    <span className="field-error">{registerFieldErrors.studies}</span>
                  )}
                </label>

                <div className="skills-grid">
                  <label>
                    Skill 1
                    <select name="skill1" defaultValue="1" required>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </label>

                  <label>
                    Skill 2
                    <select name="skill2" defaultValue="1" required>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </label>

                  <label>
                    Skill 3
                    <select name="skill3" defaultValue="1" required>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </label>

                  <label>
                    Skill 4
                    <select name="skill4" defaultValue="1" required>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </label>
                </div>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isLeaderCheckbox"
                    checked={isLeader}
                    onChange={(event) => setIsLeader(event.target.checked)}
                  />
                  Soy líder de equipo
                </label>

                {isLeader && (
                  <label>
                    Nombre del equipo
                    <input type="text" name="teamName" placeholder="" required />
                    {registerFieldErrors.teamName && (
                      <span className="field-error">{registerFieldErrors.teamName}</span>
                    )}
                  </label>
                )}

                {registerError && <p className="form-error">{registerError}</p>}

                <button
                  type="submit"
                  className="primary-button primary-button-dark"
                  disabled={isRegisterLoading}
                >
                  {isRegisterLoading ? 'Registrando...' : 'Registrarme'}
                </button>
              </form>

              <button
                type="button"
                className="auth-secondary-action"
                onClick={closeRegisterPanel}
              >
                Ya tengo cuenta, iniciar sesión
              </button>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default AuthPage