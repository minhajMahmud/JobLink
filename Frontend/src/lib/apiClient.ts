/**
 * Shared Axios instance used by all feature API modules.
 * Automatically attaches JWT token and user headers from localStorage.
 */
import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const apiClient = axios.create({ baseURL: API_URL });

const AUTH_STORAGE_KEY = "joblink.auth.user";
const TOKEN_KEY = "token";

function getStoredAuthUser(): { id?: string; role?: string } | null {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as { id?: string; role?: string }) : null;
    } catch {
        return null;
    }
}

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const authUser = getStoredAuthUser();
    if (authUser?.id) config.headers["x-user-id"] = authUser.id;
    if (authUser?.role) config.headers["x-user-role"] = authUser.role;

    return config;
});

export default apiClient;
