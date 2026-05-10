import apiClient from "@/lib/apiClient";

export interface NetworkUser {
    id: string;
    name: string;
    title: string;
    avatar: string;
    company: string;
    connections: number;
    role: string;
    location?: string;
}

export interface ConnectionStatus {
    status: "none" | "pending" | "accepted";
}

export async function getSuggestions(limit = 20): Promise<{ success: boolean; data: NetworkUser[] }> {
    const res = await apiClient.get("/network/suggestions", { params: { limit } });
    return res.data;
}

export async function getConnections(): Promise<{ success: boolean; data: NetworkUser[] }> {
    const res = await apiClient.get("/network/connections");
    return res.data;
}

export async function sendConnectionRequest(
    userId: string
): Promise<{ success: boolean; status: string }> {
    const res = await apiClient.post(`/network/connect/${userId}`);
    return res.data;
}

export async function removeConnection(
    userId: string
): Promise<{ success: boolean }> {
    const res = await apiClient.delete(`/network/connect/${userId}`);
    return res.data;
}

export async function getPendingRequests(): Promise<{ success: boolean; data: NetworkUser[] }> {
    const res = await apiClient.get("/network/requests");
    return res.data;
}

export async function acceptConnectionRequest(
    requesterId: string
): Promise<{ success: boolean; status: string }> {
    const res = await apiClient.patch(`/network/connect/${requesterId}/accept`);
    return res.data;
}
