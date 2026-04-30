import axios from "axios";
import type {
    Post,
    Comment,
    ReactionType,
    PostVisibility,
    PostAttachment,
    PollData,
} from "@/data/mockData";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({ baseURL: API_URL });

const AUTH_STORAGE_KEY = "joblink.auth.user";

function getStoredAuthUser(): { id?: string; role?: string } | null {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as { id?: string; role?: string }) : null;
    } catch {
        return null;
    }
}

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const authUser = getStoredAuthUser();
    if (authUser?.id) config.headers["x-user-id"] = authUser.id;
    if (authUser?.role) config.headers["x-user-role"] = authUser.role;

    return config;
});

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface FeedMeta {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export interface FeedResponse {
    success: boolean;
    data: Post[];
    meta: FeedMeta;
    message?: string;
}

export interface PostResponse {
    success: boolean;
    data?: Post;
    message?: string;
}

export interface CommentResponse {
    success: boolean;
    data?: Comment;
    message?: string;
}

export interface ReactResponse {
    success: boolean;
    data?: { userReaction: ReactionType | null };
    message?: string;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/** Fetch paginated feed posts */
export async function getFeedPosts(page = 1, limit = 20): Promise<FeedResponse> {
    const response = await api.get<FeedResponse>("/feed", {
        params: { page, limit },
    });
    return response.data;
}

export interface CreatePostPayload {
    content: string;
    visibility: PostVisibility;
    attachments: PostAttachment[];
    poll?: PollData;
    scheduledFor?: string;
    hashtags: string[];
    relevanceTags?: string[];
    imageUrl?: string;
}

/** Create a new post */
export async function createPost(payload: CreatePostPayload): Promise<PostResponse> {
    const response = await api.post<PostResponse>("/feed/posts", payload);
    return response.data;
}

/** Toggle or change a reaction on a post */
export async function reactToPost(
    postId: string,
    reaction: ReactionType
): Promise<ReactResponse> {
    const response = await api.post<ReactResponse>(`/feed/posts/${postId}/react`, {
        reaction,
    });
    return response.data;
}

/** Add a comment or reply to a post */
export async function addComment(
    postId: string,
    content: string,
    parentCommentId?: string
): Promise<CommentResponse> {
    const response = await api.post<CommentResponse>(`/feed/posts/${postId}/comment`, {
        content,
        parentCommentId: parentCommentId ?? null,
    });
    return response.data;
}

/** Repost / share a post with optional commentary */
export async function sharePost(
    postId: string,
    commentary?: string
): Promise<PostResponse> {
    const response = await api.post<PostResponse>(`/feed/posts/${postId}/share`, {
        commentary: commentary ?? "",
    });
    return response.data;
}

/** Vote on a poll option */
export async function votePoll(
    postId: string,
    optionId: string
): Promise<{ success: boolean; data?: { poll: PollData }; message?: string }> {
    const response = await api.post(`/feed/posts/${postId}/poll-vote`, { optionId });
    return response.data;
}

/** Delete a post (owner only) */
export async function deletePost(
    postId: string
): Promise<{ success: boolean; message?: string }> {
    const response = await api.delete(`/feed/posts/${postId}`);
    return response.data;
}
