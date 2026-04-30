import apiClient from "@/lib/apiClient";
import type { AuthUser, UserRole } from "@/features/auth/context/AuthContext";

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
    first_name: string;
    last_name?: string;
    role?: UserRole;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: AuthUser;
    message?: string;
}

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/login", payload);
    return res.data;
}

export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/register", payload);
    return res.data;
}

export async function getMeApi(): Promise<AuthResponse> {
    const res = await apiClient.get<AuthResponse>("/auth/me");
    return res.data;
}

export async function logoutApi(): Promise<void> {
    await apiClient.post("/auth/logout").catch(() => { });
}
