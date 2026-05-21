import { API_BASE_URL } from "./apiConfig";

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  isFormData?: boolean;
};

function getFriendlyErrorMessage(status: number, rawMessage: string) {
  const message = rawMessage.toLowerCase();

  if (status === 400) {
    if (
      message.includes("username") ||
      message.includes("user") ||
      message.includes("usuario")
    ) {
      return "El nombre de usuario no es válido o ya está en uso.";
    }

    if (message.includes("password") || message.includes("contraseña")) {
      return "La contraseña no cumple los requisitos.";
    }

    if (message.includes("photo") || message.includes("foto")) {
      return "La foto es obligatoria.";
    }

    if (message.includes("team") || message.includes("equipo")) {
      return "Revisa el nombre del equipo.";
    }

    return "Revisa los datos del formulario.";
  }

  if (status === 401) {
    return "Usuario o contraseña incorrectos.";
  }

  if (status === 403) {
    return "No tienes permiso para realizar esta acción.";
  }

  if (status === 404) {
    return "No se ha encontrado el recurso solicitado.";
  }

  if (status >= 500) {
    return "Ha ocurrido un error en el servidor. Inténtalo de nuevo más tarde.";
  }

  return rawMessage || "Ha ocurrido un error inesperado.";
}

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const errorBody = await response.json();

      if (typeof errorBody === "string") {
        return errorBody;
      }

      if (typeof errorBody?.message === "string") {
        return errorBody.message;
      }

      if (typeof errorBody?.title === "string") {
        return errorBody.title;
      }

      if (errorBody?.errors) {
        const firstError = Object.values(errorBody.errors).flat()[0];

        if (typeof firstError === "string") {
          return firstError;
        }
      }

      return "";
    }

    return await response.text();
  } catch {
    return "";
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, token, isFormData = false } = options;

  const headers: HeadersInit = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body
        ? isFormData
          ? (body as FormData)
          : JSON.stringify(body)
        : undefined,
    });
  } catch {
    throw new Error("No se ha podido conectar con el servidor.");
  }

  if (!response.ok) {
    const rawMessage = await readErrorMessage(response);
    const friendlyMessage = getFriendlyErrorMessage(
      response.status,
      rawMessage,
    );

    throw new Error(friendlyMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
