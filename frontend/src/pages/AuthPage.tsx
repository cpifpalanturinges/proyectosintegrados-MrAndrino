import { useState, type FormEvent, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, login, register } from "../api/authApi";
import AuthCarousel from "../components/auth/AuthCarousel";
import PhotoInput from "../components/auth/PhotoInput";
import diverxiaLogo from "../assets/branding/diverxia-logo.png";
import { saveAuthSession, saveStoredUser } from "../utils/authStorage";
import { skillLabels } from "../utils/skillLabels";

type AuthMode = "login" | "register";

type RegisterField =
  | "username"
  | "firstName"
  | "lastName"
  | "password"
  | "confirmPassword"
  | "photo"
  | "studies"
  | "teamName";

type RegisterFieldErrors = Partial<Record<RegisterField, string>>;

type RegisterFormValues = {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  studies: string;
  photo: FormDataEntryValue | null;
  teamName: string;
};

const skillOptions = ["1", "2", "3", "4", "5"];

function getRegisterFormValues(formData: FormData): RegisterFormValues {
  return {
    username: String(formData.get("username") ?? "").trim(),
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    password: String(formData.get("password") ?? "").trim(),
    confirmPassword: String(formData.get("confirmPassword") ?? "").trim(),
    studies: String(formData.get("studies") ?? "").trim(),
    photo: formData.get("photo"),
    teamName: String(formData.get("teamName") ?? "").trim(),
  };
}

function getBackendFieldError(message: string): RegisterField | null {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("usuario") ||
    normalizedMessage.includes("username") ||
    normalizedMessage.includes("user")
  ) {
    return "username";
  }

  if (
    normalizedMessage.includes("contraseña") ||
    normalizedMessage.includes("password")
  ) {
    return "password";
  }

  if (
    normalizedMessage.includes("foto") ||
    normalizedMessage.includes("photo")
  ) {
    return "photo";
  }

  if (
    normalizedMessage.includes("equipo") ||
    normalizedMessage.includes("team")
  ) {
    return "teamName";
  }

  return null;
}

function AuthPage() {
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isRegisterClosing, setIsRegisterClosing] = useState(false);
  const [isLeader, setIsLeader] = useState(false);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [registerError, setRegisterError] = useState("");
  const [registerFieldErrors, setRegisterFieldErrors] =
    useState<RegisterFieldErrors>({});
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  const isRegisterMode = authMode === "register";
  const shouldShowRegisterContent = isRegisterMode || isRegisterClosing;

  function openRegisterPanel() {
    setIsRegisterClosing(false);
    setAuthMode("register");
  }

  function closeRegisterPanel() {
    if (!isRegisterMode || isRegisterClosing) {
      return;
    }

    setIsRegisterClosing(true);
    setAuthMode("login");

    window.setTimeout(() => {
      setIsRegisterClosing(false);
    }, 450);
  }

  function stopPanelClick(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }

  function scrollToRegisterField(fieldName: RegisterField) {
    window.setTimeout(() => {
      const field = document.querySelector<HTMLElement>(
        `[name="${fieldName}"]`,
      );

      field?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      field?.focus();
    }, 50);
  }

  function setRegisterFieldError(fieldName: RegisterField, message: string) {
    setRegisterFieldErrors({ [fieldName]: message });
    setRegisterError("");
    setIsRegisterLoading(false);
    scrollToRegisterField(fieldName);
  }

  function validateRegisterForm(values: RegisterFormValues) {
    if (!values.username) {
      setRegisterFieldError("username", "El usuario es obligatorio.");
      return false;
    }

    if (values.username.length < 3) {
      setRegisterFieldError(
        "username",
        "El usuario debe tener al menos 3 caracteres.",
      );
      return false;
    }

    if (!values.firstName) {
      setRegisterFieldError("firstName", "El nombre es obligatorio.");
      return false;
    }

    if (!values.lastName) {
      setRegisterFieldError("lastName", "Los apellidos son obligatorios.");
      return false;
    }

    if (!values.password) {
      setRegisterFieldError("password", "La contraseña es obligatoria.");
      return false;
    }

    if (values.password.length < 6) {
      setRegisterFieldError(
        "password",
        "La contraseña debe tener al menos 6 caracteres.",
      );
      return false;
    }

    if (!values.confirmPassword) {
      setRegisterFieldError(
        "confirmPassword",
        "Debes confirmar la contraseña.",
      );
      return false;
    }

    if (values.password !== values.confirmPassword) {
      setRegisterFieldError("confirmPassword", "Las contraseñas no coinciden.");
      return false;
    }

    if (!values.studies) {
      setRegisterFieldError("studies", "Los estudios son obligatorios.");
      return false;
    }

    if (!(values.photo instanceof File) || values.photo.size === 0) {
      setRegisterFieldError("photo", "La foto es obligatoria.");
      return false;
    }

    if (isLeader && !values.teamName) {
      setRegisterFieldError(
        "teamName",
        "Si eres líder, debes indicar el nombre del equipo.",
      );
      return false;
    }

    return true;
  }

  function normalizeRegisterFormData(
    formData: FormData,
    values: RegisterFormValues,
  ) {
    formData.set("username", values.username);
    formData.set("firstName", values.firstName);
    formData.set("lastName", values.lastName);
    formData.set("password", values.password);
    formData.set("studies", values.studies);
    formData.set("isLeader", String(isLeader));
    formData.delete("confirmPassword");

    if (!isLeader) {
      formData.delete("teamName");
    }
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoginError("");
    setIsLoginLoading(true);

    try {
      const authResponse = await login({
        username: loginUsername,
        password: loginPassword,
      });

      saveAuthSession(authResponse);

      const currentUser = await getCurrentUser(authResponse.token);
      saveStoredUser(currentUser);

      navigate("/app");
    } catch (error) {
      console.error(error);
      setLoginError("No se ha podido iniciar sesión.");
    } finally {
      setIsLoginLoading(false);
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setRegisterError("");
    setRegisterFieldErrors({});
    setIsRegisterLoading(true);

    const formData = new FormData(event.currentTarget);
    const values = getRegisterFormValues(formData);

    if (!validateRegisterForm(values)) {
      return;
    }

    normalizeRegisterFormData(formData, values);

    try {
      const authResponse = await register(formData);

      saveAuthSession(authResponse);

      const currentUser = await getCurrentUser(authResponse.token);
      saveStoredUser(currentUser);

      navigate("/app");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        const fieldName = getBackendFieldError(error.message);

        if (fieldName === "username") {
          setRegisterFieldError(
            "username",
            "Ese nombre de usuario no está disponible.",
          );
          return;
        }

        if (fieldName === "password") {
          setRegisterFieldError(
            "password",
            "La contraseña no cumple los requisitos.",
          );
          return;
        }

        if (fieldName === "photo") {
          setRegisterFieldError("photo", "La foto es obligatoria.");
          return;
        }

        if (fieldName === "teamName") {
          setRegisterFieldError("teamName", "Revisa el nombre del equipo.");
          return;
        }

        setRegisterError(error.message);
      } else {
        setRegisterError("No se ha podido completar el registro.");
      }
    } finally {
      setIsRegisterLoading(false);
    }
  }

  return (
    <main
      className={`auth-page ${shouldShowRegisterContent ? "auth-page-register" : ""}`}
      onClick={closeRegisterPanel}
    >
      <section className="auth-shell">
        <div className="auth-header">
          <div className="auth-brand">
            <img
              src={diverxiaLogo}
              alt="Diverxia"
              className="auth-brand-logo"
            />
          </div>

          <h1>
            Team<span>Draft</span>
          </h1>

          <div className="auth-divider" />

          <p>
            Forma tu <span>equipo.</span>
          </p>
        </div>

        <section
          className={`auth-login-panel ${shouldShowRegisterContent ? "auth-login-hidden" : ""}`}
        >
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

            <button
              type="submit"
              className="primary-button"
              disabled={isLoginLoading}
            >
              {isLoginLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </section>

        <AuthCarousel />

        <section
          className={`auth-register-panel ${isRegisterMode ? "auth-register-open" : ""} ${
            isRegisterClosing ? "auth-register-closing" : ""
          }`}
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

              <form
                className="auth-form register-form"
                onSubmit={handleRegisterSubmit}
              >
                <p className="register-section-title">Datos personales</p>

                <label>
                  Usuario
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    required
                  />
                  {registerFieldErrors.username && (
                    <span className="field-error">
                      {registerFieldErrors.username}
                    </span>
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
                    <span className="field-error">
                      {registerFieldErrors.studies}
                    </span>
                  )}
                </label>

                <label>
                  Nombre
                  <input
                    type="text"
                    name="firstName"
                    autoComplete="given-name"
                    required
                  />
                  {registerFieldErrors.firstName && (
                    <span className="field-error">
                      {registerFieldErrors.firstName}
                    </span>
                  )}
                </label>

                <label>
                  Apellidos
                  <input
                    type="text"
                    name="lastName"
                    autoComplete="family-name"
                    required
                  />
                  {registerFieldErrors.lastName && (
                    <span className="field-error">
                      {registerFieldErrors.lastName}
                    </span>
                  )}
                </label>

                <p className="register-section-title">Acceso</p>

                <label>
                  Contraseña
                  <input
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    required
                  />
                  {registerFieldErrors.password && (
                    <span className="field-error">
                      {registerFieldErrors.password}
                    </span>
                  )}
                </label>

                <label>
                  Confirmar contraseña
                  <input
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    required
                  />
                  {registerFieldErrors.confirmPassword && (
                    <span className="field-error">
                      {registerFieldErrors.confirmPassword}
                    </span>
                  )}
                </label>

                <p className="register-section-title">Perfil</p>

                <label className="register-photo-field">
                  Foto
                  <PhotoInput error={registerFieldErrors.photo} />
                </label>

                <div className="skills-grid">
                  {[1, 2, 3, 4].map((skillNumber) => {
                    const skillName =
                      `skill${skillNumber}` as keyof typeof skillLabels;

                    return (
                      <label key={skillName} className="skill-field">
                        <span className="skill-field-label">
                          {skillLabels[skillName]}
                        </span>

                        <select name={skillName} defaultValue="1" required>
                          {skillOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                    );
                  })}
                </div>

                <p className="register-section-title register-team-section-title">
                  Equipo
                </p>

                <label className="checkbox-label register-leader-row">
                  <input
                    type="checkbox"
                    name="isLeaderCheckbox"
                    checked={isLeader}
                    onChange={(event) => setIsLeader(event.target.checked)}
                  />
                  Soy líder de equipo
                </label>

                {isLeader && (
                  <label className="register-team-field">
                    Nombre del equipo
                    <input type="text" name="teamName" required />
                    {registerFieldErrors.teamName && (
                      <span className="field-error">
                        {registerFieldErrors.teamName}
                      </span>
                    )}
                  </label>
                )}

                {registerError && (
                  <p className="form-error register-form-error">
                    {registerError}
                  </p>
                )}

                <button
                  type="submit"
                  className="primary-button primary-button-dark register-submit-button"
                  disabled={isRegisterLoading}
                >
                  {isRegisterLoading ? "Registrando..." : "Registrarme"}
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
  );
}

export default AuthPage;
