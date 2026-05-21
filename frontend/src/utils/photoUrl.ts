import { API_BASE_URL } from "../api/apiConfig";

export function getPhotoUrl(photoPath?: string | null): string {
  if (!photoPath) {
    return `${API_BASE_URL}/images/default-profile.png`;
  }

  if (photoPath.startsWith("http")) {
    return photoPath;
  }

  return `${API_BASE_URL}${photoPath}`;
}
