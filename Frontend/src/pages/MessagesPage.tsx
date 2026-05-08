import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Briefcase,
  Check,
  CheckCheck,
  Circle,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Shield,
  SmilePlus,
  Users,
  Video,
  X,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  getConversations,
  getConversationMessages,
  sendMessage as apiSendMessage,
  updateTypingStatus as apiUpdateTyping,
  getTypingUsers as apiGetTypingUsers,
  updateOnlineStatus as apiUpdateOnlineStatus,
  getUserOnlineStatus as apiGetUserOnlineStatus,
  uploadFiles as apiUploadFiles,
  markMessageAsRead as apiMarkRead,
  type Conversation,
  type Message,
  type SendMessagePayload,
} from "@/features/messaging/api/messagingApi";

type RoleKey = "seeker" | "employer" | "admin";

interface AttachmentItem {
  id: string;
  name: string;
  kind: "image" | "pdf" | "file";
  sizeLabel: string;
  previewUrl?: string;
  file?: File;
}

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  status: "sent" | "delivered" | "seen";
  attachments: AttachmentItem[];
}

interface LocalConversation {
  id: string;
  name: string;
  title: string;
  avatar: string;
  online: boolean;
  unread: number;
  lastSeen: string;
  category: string;
  messages: ChatMessage[];
}

const themeByRole: Record<RoleKey, { label: string; accent: string; description: string }> = {
  seeker: {
    label: "Candidate Inbox",
    accent: "from-blue-600 via-violet-600 to-fuchsia-600",
    description: "Connect with recruiters, hiring teams, and support in one premium workspace.",
  },
  employer: {
    label: "Hiring Inbox",
    accent: "from-emerald-600 via-teal-600 to-cyan-600",
    description: "Talk to candidates, hiring partners, and internal reviewers with clear message states.",
  },
  admin: {
    label: "Operations Inbox",
    accent: "from-amber-600 via-orange-600 to-rose-600",
    description: "Coordinate moderation, support, and escalation conversations with traceable activity.",
  },
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusIcon(status: string) {
  if (status === "seen") return <CheckCheck className="h-3.5 w-3.5 text-primary" />;
  if (status === "delivered") return <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />;
  return <Check className="h-3.5 w-3.5 text-muted-foreground" />;
}

function toChatMessage(msg: Message, userId: string, attachments: AttachmentItem[] = []): ChatMessage {
  return {
    id: msg.id,
    senderId: msg.sender_id,
    text: msg.content || "",
    createdAt: formatMessageTime(msg.created_at),
    status: "delivered",
    attachments,
  };
}

function formatMessageTime(timestamp: string): string {
  if (!timestamp) return "Just now";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face";

export default function MessagesPage() {
  const { user } = useAuth();
  const role = (user?.role ?? "seeker") as RoleKey;
  const theme = themeByRole[role];
  const userId = user?.id ?? "";

  const [search, setSearch] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string>("");
  const [conversations, setConversations] = useState<LocalConversation[]>([]);
  const [draft, setDraft] = useState("");
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [draftAttachments, setDraftAttachments] = useState<AttachmentItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const pollIntervalRef = useRef<number | null>(null);

  // ---------------------------------------------------------------------------
  // Load conversations on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const res = await getConversations(50, 0);
        if (!cancelled && res.success) {
          const local: LocalConversation[] = res.conversations.map((conv) => ({
            id: conv.id,
            name: conv.other_user_name || "Unknown User",
            title: "",
            avatar: conv.other_user_avatar || DEFAULT_AVATAR,
            online: false,
            unread: conv.unread_count || 0,
            lastSeen: conv.last_message_at ? formatMessageTime(conv.last_message_at) : "",
            category: "Direct",
            messages: [],
          }));

          setConversations(local);

          // Update online status
          if (userId) {
            apiUpdateOnlineStatus(true).catch(() => {});
          }
        }
      } catch {
        // Keep empty state
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    // Poll for new conversations every 10 seconds
    pollIntervalRef.current = window.setInterval(async () => {
      try {
        const res = await getConversations(50, 0);
        if (res.success) {
          setConversations((prev) => {
            const updated = [...prev];
            for (const conv of res.conversations) {
              const existing = updated.find((c) => c.id === conv.id);
              if (existing) {
                existing.unread = conv.unread_count || 0;
                existing.lastSeen = conv.last_message_at ? formatMessageTime(conv.last_message_at) : "";
              } else {
                updated.push({
                  id: conv.id,
                  name: conv.other_user_name || "Unknown User",
                  title: "",
                  avatar: conv.other_user_avatar || DEFAULT_AVATAR,
                  online: false,
                  unread: conv.unread_count || 0,
                  lastSeen: conv.last_message_at ? formatMessageTime(conv.last_message_at) : "",
                  category: "Direct",
                  messages: [],
                });
              }
            }
            return updated;
          });
        }
      } catch {
        // Ignore poll errors
      }
    }, 10000);

    return () => {
      cancelled = true;
      if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
      apiUpdateOnlineStatus(false).catch(() => {});
    };
  }, [userId]);

  // ---------------------------------------------------------------------------
  // Load messages when conversation changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedConversationId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const res = await getConversationMessages(selectedConversationId, 100, 0);
        if (!cancelled && res.success) {
          const chatMessages = (res.messages || []).map((msg) => toChatMessage(msg, userId));

          // Mark unread messages as read
          for (const msg of res.messages || []) {
            if (msg.sender_id !== userId) {
              apiMarkRead(msg.id).catch(() => {});
            }
          }

          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === selectedConversationId
                ? { ...conv, messages: chatMessages, unread: 0 }
                : conv
            )
          );
        }
      } catch {
        // Keep existing messages
      }
    };

    load();

    // Poll for new messages in active conversation
    const msgPoll = window.setInterval(async () => {
      const res = await getConversationMessages(selectedConversationId, 100, 0).catch(() => null);
      if (res?.success) {
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== selectedConversationId) return conv;

            const existingIds = new Set(conv.messages.map((m) => m.id));
            const newMsgs = (res.messages || [])
              .filter((msg) => !existingIds.has(msg.id))
              .map((msg) => toChatMessage(msg, userId));

            if (newMsgs.length === 0) return conv;

            // Mark new messages as read
            for (const msg of res.messages || []) {
              if (msg.sender_id !== userId && !existingIds.has(msg.id)) {
                apiMarkRead(msg.id).catch(() => {});
              }
            }

            return {
              ...conv,
              messages: [...conv.messages, ...newMsgs],
              unread: 0,
            };
          })
        );
      }
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(msgPoll);
    };
  }, [selectedConversationId, userId]);

  // ---------------------------------------------------------------------------
  // Auto-scroll
  // ---------------------------------------------------------------------------
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversations, selectedConversationId]);

  // ---------------------------------------------------------------------------
  // Cleanup on unmount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
      draftAttachments.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [draftAttachments]);

  // ---------------------------------------------------------------------------
  // Active conversation
  // ---------------------------------------------------------------------------
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) ?? conversations[0],
    [conversations, selectedConversationId]
  );

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const haystack = `${c.name} ${c.title} ${c.category}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [conversations, search]);

  // Always select first conversation if none selected
  useEffect(() => {
    if (!selectedConversationId && conversations[0]) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleDraftChange = (value: string) => {
    setDraft(value);
    setIsUserTyping(Boolean(value.trim()));

    // Send typing indicator
    if (activeConversation) {
      apiUpdateTyping(activeConversation.id, Boolean(value.trim())).catch(() => {});
    }

    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      setIsUserTyping(false);
      if (activeConversation) {
        apiUpdateTyping(activeConversation.id, false).catch(() => {});
      }
    }, 2200);
  };

  const handleAttachments = (files: FileList | null) => {
    if (!files?.length) return;

    const nextItems: AttachmentItem[] = [];
    let validationMessage: string | null = null;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        validationMessage = "Each attachment must be 10 MB or smaller.";
        return;
      }

      const kind: "image" | "pdf" | "file" = file.type.startsWith("image/") ? "image" : file.type === "application/pdf" ? "pdf" : "file";
      nextItems.push({
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        kind,
        sizeLabel: formatSize(file.size),
        previewUrl: kind === "image" ? URL.createObjectURL(file) : undefined,
        file,
      });
    });

    if (validationMessage) {
      setStatusMessage(validationMessage);
      return;
    }

    if (nextItems.length) {
      setStatusMessage(null);
      setDraftAttachments((current) => [...current, ...nextItems]);
    }
  };

  const removeAttachment = (id: string) => {
    setDraftAttachments((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  };

  const sendMessageHandler = useCallback(async () => {
    if (!activeConversation || (!draft.trim() && draftAttachments.length === 0) || sendingMessage) return;
    setSendingMessage(true);

    const timestamp = new Date().toISOString();
    const outgoingId = `msg-${Date.now()}`;

    // Optimistic local message
    const outgoingMessage: ChatMessage = {
      id: outgoingId,
      senderId: userId || "current",
      text: draft.trim(),
      createdAt: "Just now",
      status: "sent",
      attachments: draftAttachments,
    };

    // Add optimistically
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id !== activeConversation.id
          ? conv
          : { ...conv, unread: 0, messages: [...conv.messages, outgoingMessage] }
      )
    );

    const textContent = draft.trim();
    setDraft("");
    setIsUserTyping(false);
    setStatusMessage(null);

    const currentAttachments = [...draftAttachments];
    setDraftAttachments((current) => {
      current.forEach((item) => { if (item.previewUrl) URL.revokeObjectURL(item.previewUrl); });
      return [];
    });

    try {
      // Send message to API
      const res = await apiSendMessage({
        recipient_id: activeConversation.id, // This will be replaced with actual user ID lookup
        content: textContent || "Shared files",
        message_type: currentAttachments.length > 0 ? "file" : "text",
      });

      if (res.success) {
        // Replace optimistic message with real one
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== activeConversation.id) return conv;

            // Send attachments if any
            if (currentAttachments.length > 0 && res.conversation_id) {
              const formData = new FormData();
              for (const att of currentAttachments) {
                if (att.file) formData.append("files[]", att.file);
              }
              formData.append("recipient_id", activeConversation.id);
              formData.append("message", textContent || "Shared files");
              apiUploadFiles(formData).catch(() => {});
            }

            return {
              ...conv,
              messages: conv.messages.map((m) =>
                m.id === outgoingId && res.message
                  ? toChatMessage(res.message, userId || "")
                  : m
              ),
            };
          })
        );
      }
    } catch {
      // Keep optimistic message
    } finally {
      setSendingMessage(false);
    }
  }, [activeConversation, draft, draftAttachments, userId, sendingMessage]);

  // Stop typing when sending
  useEffect(() => {
    if (activeConversation) {
      apiUpdateTyping(activeConversation.id, false).catch(() => {});
    }
  }, [selectedConversationId]);

  const activeMessages = activeConversation?.messages ?? [];

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-7xl flex-col gap-6">
      <section className={`overflow-hidden rounded-[2rem] border border-border bg-gradient-to-r ${theme.accent} p-6 text-white shadow-lg sm:p-8`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">Messaging System</p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{theme.label}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">{theme.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-left sm:min-w-[320px]">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-white/75">Conversations</p>
              <p className="mt-2 text-2xl font-bold">{conversations.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-white/75">Online</p>
              <p className="mt-2 text-2xl font-bold">{conversations.filter((c) => c.online).length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-white/75">Unread</p>
              <p className="mt-2 text-2xl font-bold">{conversations.reduce((sum, c) => sum + c.unread, 0)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid flex-1 gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="flex min-h-[640px] flex-col rounded-[2rem] border border-border bg-card shadow-card">
          <div className="border-b border-border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations"
                className="h-11 w-full rounded-2xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {isLoading && conversations.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">Loading conversations...</div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conversation) => {
                  const isActive = conversation.id === activeConversation?.id;

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all ${isActive ? "border-primary bg-primary/5 shadow-sm" : "border-transparent hover:border-border hover:bg-secondary/60"}`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={conversation.avatar}
                          alt={conversation.name}
                          className="h-12 w-12 rounded-2xl object-cover"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${conversation.online ? "bg-emerald-500" : "bg-muted-foreground"}`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="truncate font-semibold text-foreground">{conversation.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{conversation.title}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {conversation.unread > 0 && (
                              <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                                {conversation.unread}
                              </span>
                            )}
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span className="truncate">
                            {conversation.messages.at(-1)?.text ?? "No messages yet"}
                          </span>
                          <span className="shrink-0">{conversation.lastSeen}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="rounded-full bg-secondary px-2 py-1 text-[11px] font-semibold text-secondary-foreground">
                            {conversation.category}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Circle
                              className={`h-2.5 w-2.5 ${conversation.online ? "fill-emerald-500 text-emerald-500" : "fill-muted-foreground text-muted-foreground"}`}
                            />
                            {conversation.online ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filteredConversations.length === 0 && !isLoading && (
                  <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
                    No conversations yet. Connect with other users to start messaging.
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        <section className="flex min-h-[640px] flex-col overflow-hidden rounded-[2rem] border border-border bg-card shadow-card">
          {activeConversation ? (
            <>
              <header className="flex items-center justify-between gap-4 border-b border-border p-4 sm:p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={activeConversation.avatar}
                      alt={activeConversation.name}
                      className="h-12 w-12 rounded-2xl object-cover"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${activeConversation.online ? "bg-emerald-500" : "bg-muted-foreground"}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate font-display text-xl font-semibold text-foreground">
                        {activeConversation.name}
                      </h2>
                      {role === "admin" ? (
                        <Shield className="h-4 w-4 text-amber-500" />
                      ) : role === "employer" ? (
                        <Briefcase className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Users className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{activeConversation.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary"
                    aria-label="Start voice call"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary"
                    aria-label="Start video call"
                  >
                    <Video className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary"
                    aria-label="More options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </header>

              <div className="flex items-center justify-between border-b border-border px-5 py-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${activeConversation.online ? "bg-emerald-500" : "bg-muted-foreground"}`}
                  />
                  {activeConversation.online ? "Online now" : activeConversation.lastSeen || "Offline"}
                </span>
                <span>Connected to API — polling for new messages</span>
              </div>

              <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-secondary/20 p-4 sm:p-6">
                {activeMessages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No messages yet. Send the first message!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeMessages.map((message) => {
                      const isMine = message.senderId === userId || message.senderId === (user?.id ?? `${role}-current`);

                      return (
                        <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[82%] rounded-3xl border px-4 py-3 shadow-sm ${
                              isMine ? "border-primary/20 bg-primary text-primary-foreground" : "border-border bg-card"
                            }`}
                          >
                            {message.text && <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>}

                            {message.attachments.length > 0 && (
                              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                {message.attachments.map((attachment) => (
                                  <div
                                    key={attachment.id}
                                    className={`overflow-hidden rounded-2xl border ${
                                      isMine ? "border-white/20 bg-white/10" : "border-border bg-background"
                                    }`}
                                  >
                                    {attachment.kind === "image" && attachment.previewUrl ? (
                                      <img
                                        src={attachment.previewUrl}
                                        alt={attachment.name}
                                        className="h-40 w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex items-center gap-3 p-3">
                                        {attachment.kind === "pdf" ? (
                                          <FileText className="h-5 w-5 text-red-500" />
                                        ) : (
                                          <Paperclip className="h-5 w-5 text-muted-foreground" />
                                        )}
                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-medium">{attachment.name}</p>
                                          <p className="text-xs text-muted-foreground">{attachment.sizeLabel}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div
                              className={`mt-2 flex items-center justify-between text-[11px] ${
                                isMine ? "text-white/80" : "text-muted-foreground"
                              }`}
                            >
                              <span>{message.createdAt}</span>
                              {isMine ? (
                                <span className="inline-flex items-center gap-1">
                                  {statusIcon(message.status)} {message.status}
                                </span>
                              ) : (
                                <span>Delivered</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div ref={messageEndRef} />
                  </div>
                )}
              </div>

              <footer className="border-t border-border bg-card p-4 sm:p-5">
                {statusMessage && (
                  <div className="mb-3 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {statusMessage}
                  </div>
                )}

                {draftAttachments.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-3">
                    {draftAttachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 px-3 py-2"
                      >
                        {attachment.kind === "image" && attachment.previewUrl ? (
                          <img
                            src={attachment.previewUrl}
                            alt={attachment.name}
                            className="h-10 w-10 rounded-xl object-cover"
                          />
                        ) : attachment.kind === "pdf" ? (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                            <FileText className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                            <Paperclip className="h-5 w-5" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="max-w-44 truncate text-sm font-medium text-foreground">{attachment.name}</p>
                          <p className="text-xs text-muted-foreground">{attachment.sizeLabel}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeAttachment(attachment.id)}
                          className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                          aria-label={`Remove ${attachment.name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-3 rounded-[1.5rem] border border-border bg-background p-3 shadow-sm">
                  <button
                    type="button"
                    className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary"
                    aria-label="Add emoji"
                  >
                    <SmilePlus className="h-4 w-4" />
                  </button>

                  <label
                    className="mb-1 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary"
                    aria-label="Attach file"
                  >
                    <Paperclip className="h-4 w-4" />
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        handleAttachments(e.target.files);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>

                  <div className="flex-1">
                    <textarea
                      value={draft}
                      onChange={(e) => handleDraftChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessageHandler();
                        }
                      }}
                      placeholder="Write a message..."
                      className="min-h-16 w-full resize-none rounded-2xl border border-transparent bg-secondary/40 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/30 focus:bg-background"
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Press Enter to send · Shift + Enter for a new line</span>
                      <span>{draft.length}/500</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={sendMessageHandler}
                    disabled={sendingMessage}
                    className={`mb-1 inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r ${theme.accent} px-5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-95 disabled:opacity-50`}
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-10 text-center">
              <div className="max-w-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">No conversation selected</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Pick a thread from the left to continue the conversation.
                </p>
              </div>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}