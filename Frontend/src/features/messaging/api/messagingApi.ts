import apiClient from "@/lib/apiClient";

export interface SendMessagePayload {
    recipient_id: string;
    content: string;
    message_type?: "text" | "file" | "image" | "system";
}

export interface Conversation {
    id: string;
    participant_1_id?: string;
    participant_2_id?: string;
    last_message_content?: string | null;
    last_message_at?: string | null;
    other_user_name?: string;
    other_user_avatar?: string;
    other_user_id?: string;
    unread_count?: number;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string | null;
    message_type: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface ConversationsResponse {
    success: boolean;
    conversations: Conversation[];
    total_unread: number;
    count: number;
}

export interface MessagesResponse {
    success: boolean;
    messages: Message[];
    total: number;
}

export interface SendMessageResponse {
    success: boolean;
    message?: Message;
    conversation_id?: string;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

export async function sendMessage(payload: SendMessagePayload): Promise<SendMessageResponse> {
    const response = await apiClient.post<SendMessageResponse>("/messaging/send", payload);
    return response.data;
}

export async function getConversations(limit = 20, offset = 0): Promise<ConversationsResponse> {
    const response = await apiClient.get<ConversationsResponse>("/messaging/conversations", {
        params: { limit, offset },
    });
    return response.data;
}

export async function getConversationMessages(
    conversationId: string,
    limit = 50,
    offset = 0
): Promise<MessagesResponse> {
    const response = await apiClient.get<MessagesResponse>(
        `/messaging/conversations/${conversationId}/messages`,
        { params: { limit, offset } }
    );
    return response.data;
}

export async function markMessageAsRead(messageId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put(`/messaging/messages/${messageId}/read`);
    return response.data;
}

export async function deleteMessage(messageId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/messaging/messages/${messageId}`);
    return response.data;
}

export async function searchMessages(
    conversationId: string,
    query: string
): Promise<{ success: boolean; messages: Message[]; count: number }> {
    const response = await apiClient.get(
        `/messaging/conversations/${conversationId}/search`,
        { params: { q: query } }
    );
    return response.data;
}

export async function updateTypingStatus(
    conversationId: string,
    isTyping: boolean
): Promise<{ success: boolean }> {
    const response = await apiClient.post(
        `/messaging/conversations/${conversationId}/typing`,
        { is_typing: isTyping }
    );
    return response.data;
}

export async function getTypingUsers(
    conversationId: string
): Promise<{ success: boolean; typing_users: Array<{ id: string; name: string; avatar: string }> }> {
    const response = await apiClient.get(`/messaging/conversations/${conversationId}/typing`);
    return response.data;
}

export async function updateOnlineStatus(isOnline: boolean): Promise<{ success: boolean }> {
    const response = await apiClient.post("/messaging/online-status", { is_online: isOnline });
    return response.data;
}

export async function getUserOnlineStatus(
    userId: string
): Promise<{ success: boolean; status: { is_online: boolean; last_seen_at: string | null } }> {
    const response = await apiClient.get(`/messaging/users/${userId}/online-status`);
    return response.data;
}

export async function blockUser(
    blockedId: string,
    reason?: string
): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post("/messaging/block", { blocked_id: blockedId, reason });
    return response.data;
}

export async function unblockUser(blockedId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/messaging/block/${blockedId}`);
    return response.data;
}

export async function uploadFiles(
    formData: FormData
): Promise<{ success: boolean; message: string; message_id?: string; files?: Array<{ file_name: string; file_path: string }> }> {
    const response = await apiClient.post("/messaging/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
}

export async function getFileDownloadUrl(attachmentId: string): Promise<string> {
    return `${apiClient.defaults.baseURL}/messaging/files/${attachmentId}/download`;
}

export async function getFilePreviewUrl(attachmentId: string): Promise<string> {
    return `${apiClient.defaults.baseURL}/messaging/files/${attachmentId}/preview`;
}