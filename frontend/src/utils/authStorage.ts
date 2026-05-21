import type { AuthResponse, CurrentUser } from "../types/authTypes";

const TOKEN_KEY = "teamdraft_token";
const USER_KEY = "teamdraft_user";

export function saveAuthSession(auth: AuthResponse) {
  sessionStorage.setItem(TOKEN_KEY, auth.token);

  const user: CurrentUser = {
    userId: auth.userId,
    username: auth.username,
    role: auth.role,

    firstName: "",
    lastName: "",
    photoPath: null,

    studies: null,
    skill1: null,
    skill2: null,
    skill3: null,
    skill4: null,

    assignedTeamId: null,
    assignedTeamName: null,
  };

  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function saveStoredUser(user: CurrentUser) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): CurrentUser | null {
  const rawUser = sessionStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as CurrentUser;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function clearAuthSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
