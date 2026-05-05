import { useNavigate } from 'react-router-dom'
import { clearAuthSession, getStoredUser } from '../utils/authStorage'

function AppHomePage() {
  const navigate = useNavigate()
  const user = getStoredUser()

  function handleLogout() {
    clearAuthSession()
    navigate('/auth')
  }

  return (
    <main className="auth-page">
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
            Sesión iniciada correctamente.
          </p>
        </div>

        <section className="auth-login-panel">
          <div className="auth-panel-header">
            <h2>Bienvenido</h2>
            <p>
              Usuario: <strong>{user?.username}</strong>
            </p>
            <p>
              Rol: <strong>{user?.role}</strong>
            </p>
          </div>

          <button type="button" className="primary-button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </section>
      </section>
    </main>
  )
}

export default AppHomePage