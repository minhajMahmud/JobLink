import apiClient from "@/lib/apiClient";
import type { AppNotification } from "@/features/notifications/context/NotificationsContext";

export interface NotificationsResponse {
    success: boolean;
    data: AppNotification[];
    unreadCount: number;
}

export async function fetchNotifications(): Promise<NotificationsResponse> {
    const res = await apiClient.get<NotificationsResponse>("/notifications");
    return res.data;
}

export async function markNotificationRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
    await apiClient.patch("/notifications/read-all");
}

export async function clearAllNotifications(): Promise<void> {
    await apiClient.delete("/notifications");
}
