import { useEffect, useMemo, useRef, useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";

type RoleKey = "seeker" | "employer" | "admin";
type MessageStatus = "sent" | "delivered" | "seen";
type AttachmentKind = "image" | "pdf" | "file";

interface AttachmentItem {
  id: string;
  name: string;
  kind: AttachmentKind;
  sizeLabel: string;
  previewUrl?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  status: MessageStatus;
  attachments: AttachmentItem[];
}

interface Conversation {
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

const roleConversationSeeds: Record<RoleKey, Conversation[]> = {
  seeker: [
    {
      id: "c1",
      name: "James Wilson",
      title: "Engineering Manager · CloudScale",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
      online: true,
      unread: 2,
      lastSeen: "Active now",
      category: "Hiring",
      messages: [
        { id: "m1", senderId: "employer-1", text: "Hey Alex — loved your profile. Are you open to a senior frontend role this week?", createdAt: "09:14 AM", status: "seen", attachments: [] },
        { id: "m2", senderId: "seeker-1", text: "Absolutely. Happy to share my recent work and availability.", createdAt: "09:17 AM", status: "delivered", attachments: [] },
      ],
    },
    {
      id: "c2",
      name: "Priya Sharma",
      title: "Talent Partner · DesignFlow",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face",
      online: false,
      unread: 0,
      lastSeen: "Seen 14m ago",
      category: "Recruiting",
      messages: [{ id: "m3", senderId: "employer-2", text: "Your resume stands out — could you send a portfolio link?", createdAt: "Yesterday", status: "seen", attachments: [] }],
    },
    {
      id: "c3",
      name: "JobLink Support",
      title: "Platform Support",
      avatar: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=120&h=120&fit=crop&crop=face",
      online: true,
      unread: 1,
      lastSeen: "Active now",
      category: "Support",
      messages: [{ id: "m4", senderId: "admin-1", text: "We reviewed your ticket and fixed the notification sync issue.", createdAt: "11:03 AM", status: "delivered", attachments: [] }],
    },
  ],
  employer: [
    {
      id: "c1",
      name: "Alex Morgan",
      title: "Senior Frontend Engineer · TechFlow Inc.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
      online: true,
      unread: 1,
      lastSeen: "Active now",
      category: "Candidate",
      messages: [{ id: "m1", senderId: "seeker-1", text: "Thanks for the opportunity — I’m available for a product demo interview tomorrow.", createdAt: "09:12 AM", status: "seen", attachments: [] }],
    },
    {
      id: "c2",
      name: "Michael Park",
      title: "HR Director · CloudScale",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
      online: false,
      unread: 0,
      lastSeen: "Seen 32m ago",
      category: "Partner",
      messages: [{ id: "m2", senderId: "employer-2", text: "Can we align on the hiring rubric before the next interview loop?", createdAt: "Yesterday", status: "delivered", attachments: [] }],
    },
    {
      id: "c3",
      name: "JobLink Admin",
      title: "Platform Operations",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop&crop=face",
      online: true,
      unread: 0,
      lastSeen: "Active now",
      category: "Operations",
      messages: [{ id: "m3", senderId: "admin-1", text: "Your company page verification was approved. Message if you need escalation support.", createdAt: "12:40 PM", status: "seen", attachments: [] }],
    },
  ],
  admin: [
    {
      id: "c1",
      name: "James Wilson",
      title: "Employer · CloudScale",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
      online: true,
      unread: 3,
      lastSeen: "Active now",
      category: "Employer",
      messages: [{ id: "m1", senderId: "employer-1", text: "We’re seeing a spike in applicants. Can we review moderation thresholds?", createdAt: "08:45 AM", status: "seen", attachments: [] }],
    },
    {
      id: "c2",
      name: "Alex Morgan",
      title: "Candidate · Senior FE",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
      online: false,
      unread: 0,
      lastSeen: "Seen 9m ago",
      category: "Candidate",
      messages: [{ id: "m2", senderId: "seeker-1", text: "Thanks for flagging the issue — I can confirm the report is accurate.", createdAt: "Yesterday", status: "delivered", attachments: [] }],
    },
    {
      id: "c3",
      name: "Policy & Trust Team",
      title: "Internal Group",
      avatar: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=120&h=120&fit=crop&crop=face",
      online: true,
      unread: 1,
      lastSeen: "Active now",
      category: "Team",
      messages: [{ id: "m3", senderId: "admin-1", text: "Reminder: audit escalations are due by 5 PM and need a read receipt.", createdAt: "11:18 AM", status: "seen", attachments: [] }],
    },
  ],
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusIcon(status: MessageStatus) {
  if (status === "seen") return <CheckCheck className="h-3.5 w-3.5 text-primary" />;
  if (status === "delivered") return <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />;
  return <Check className="h-3.5 w-3.5 text-muted-foreground" />;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const role = (user?.role ?? "seeker") as RoleKey;
  const theme = themeByRole[role];
  const [search, setSearch] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState(roleConversationSeeds[role][0]?.id ?? "");
  const [conversations, setConversations] = useState<Conversation[]>(roleConversationSeeds[role]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [draftAttachments, setDraftAttachments] = useState<AttachmentItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const deliveryTimersRef = useRef<number[]>([]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? conversations[0],
    [conversations, selectedConversationId],
  );

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const haystack = `${conversation.name} ${conversation.title} ${conversation.category}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [conversations, search]);

  useEffect(() => {
    if (!selectedConversationId && conversations[0]) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeConversation?.messages.length, selectedConversationId]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
      deliveryTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      draftAttachments.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [draftAttachments]);

  const handleDraftChange = (value: string) => {
    setDraft(value);
    setIsTyping(Boolean(value.trim()));

    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => setIsTyping(false), 2200);
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

      const kind: AttachmentKind = file.type.startsWith("image/") ? "image" : file.type === "application/pdf" ? "pdf" : "file";
      nextItems.push({
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        kind,
        sizeLabel: formatSize(file.size),
        previewUrl: kind === "image" ? URL.createObjectURL(file) : undefined,
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

  const markMessageStatus = (conversationId: string, messageId: string, status: MessageStatus) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id !== conversationId
          ? conversation
          : { ...conversation, messages: conversation.messages.map((message) => (message.id === messageId ? { ...message, status } : message)) },
      ),
    );
  };

  const sendMessage = () => {
    if (!activeConversation || (!draft.trim() && draftAttachments.length === 0)) return;

    const outgoingId = `msg-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const outgoingMessage: ChatMessage = {
      id: outgoingId,
      senderId: user?.id ?? `${role}-current`,
      text: draft.trim(),
      createdAt: timestamp,
      status: "sent",
      attachments: draftAttachments,
    };

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id !== activeConversation.id
          ? conversation
          : { ...conversation, unread: 0, lastSeen: "Just now", messages: [...conversation.messages, outgoingMessage] },
      ),
    );

    setDraft("");
    setIsTyping(false);
    setStatusMessage(null);
    setDraftAttachments((current) => {
      current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      return [];
    });

    const deliveredTimer = window.setTimeout(() => markMessageStatus(activeConversation.id, outgoingId, "delivered"), 700);
    const seenTimer = window.setTimeout(() => markMessageStatus(activeConversation.id, outgoingId, "seen"), 1500);
    deliveryTimersRef.current.push(deliveredTimer, seenTimer);

    const replyTimer = window.setTimeout(() => {
      const reply: ChatMessage = {
        id: `reply-${Date.now()}`,
        senderId: activeConversation.id,
        text: "Thanks — that’s helpful. I’ll review this and reply with next steps shortly.",
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "seen",
        attachments: [],
      };

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id !== activeConversation.id
            ? conversation
            : { ...conversation, unread: conversation.unread + 1, lastSeen: "Just now", messages: [...conversation.messages, reply] },
        ),
      );
    }, 2600);
    deliveryTimersRef.current.push(replyTimer);
  };

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
              <p className="mt-2 text-2xl font-bold">{conversations.filter((conversation) => conversation.online).length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-white/75">Unread</p>
              <p className="mt-2 text-2xl font-bold">{conversations.reduce((sum, conversation) => sum + conversation.unread, 0)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid flex-1 gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="flex min-h-[640px] flex-col rounded-[2rem] border border-border bg-card shadow-card">
          <div className="border-b border-border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations" className="h-11 w-full rounded-2xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
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
                      <img src={conversation.avatar} alt={conversation.name} className="h-12 w-12 rounded-2xl object-cover" />
                      <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${conversation.online ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="truncate font-semibold text-foreground">{conversation.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{conversation.title}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {conversation.unread > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">{conversation.unread}</span>}
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="truncate">{conversation.messages.at(-1)?.text ?? "No messages yet"}</span>
                        <span className="shrink-0">{conversation.lastSeen}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="rounded-full bg-secondary px-2 py-1 text-[11px] font-semibold text-secondary-foreground">{conversation.category}</span>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Circle className={`h-2.5 w-2.5 ${conversation.online ? "fill-emerald-500 text-emerald-500" : "fill-muted-foreground text-muted-foreground"}`} />
                          {conversation.online ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="flex min-h-[640px] flex-col overflow-hidden rounded-[2rem] border border-border bg-card shadow-card">
          {activeConversation ? (
            <>
              <header className="flex items-center justify-between gap-4 border-b border-border p-4 sm:p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative shrink-0">
                    <img src={activeConversation.avatar} alt={activeConversation.name} className="h-12 w-12 rounded-2xl object-cover" />
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${activeConversation.online ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate font-display text-xl font-semibold text-foreground">{activeConversation.name}</h2>
                      {role === "admin" ? <Shield className="h-4 w-4 text-amber-500" /> : role === "employer" ? <Briefcase className="h-4 w-4 text-emerald-500" /> : <Users className="h-4 w-4 text-blue-500" />}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{activeConversation.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary" aria-label="Start voice call">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary" aria-label="Start video call">
                    <Video className="h-4 w-4" />
                  </button>
                  <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary" aria-label="More options">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </header>

              <div className="flex items-center justify-between border-b border-border px-5 py-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${activeConversation.online ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                  {activeConversation.online ? "Online now" : activeConversation.lastSeen}
                </span>
                <span>Messages are ready for Socket.IO / JWT integration</span>
              </div>

              <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-secondary/20 p-4 sm:p-6">
                <div className="space-y-4">
                  {activeMessages.map((message) => {
                    const isMine = message.senderId === (user?.id ?? `${role}-current`);

                    return (
                      <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[82%] rounded-3xl border px-4 py-3 shadow-sm ${isMine ? "border-primary/20 bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                          {message.text && <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>}

                          {message.attachments.length > 0 && (
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              {message.attachments.map((attachment) => (
                                <div key={attachment.id} className={`overflow-hidden rounded-2xl border ${isMine ? "border-white/20 bg-white/10" : "border-border bg-background"}`}>
                                  {attachment.kind === "image" && attachment.previewUrl ? (
                                    <img src={attachment.previewUrl} alt={attachment.name} className="h-40 w-full object-cover" />
                                  ) : (
                                    <div className="flex items-center gap-3 p-3">
                                      {attachment.kind === "pdf" ? <FileText className="h-5 w-5 text-red-500" /> : <Paperclip className="h-5 w-5 text-muted-foreground" />}
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

                          <div className={`mt-2 flex items-center justify-between text-[11px] ${isMine ? "text-white/80" : "text-muted-foreground"}`}>
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

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="rounded-3xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
                        <span className="inline-flex items-center gap-2">
                          <span className="flex gap-1">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                            <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
                            <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
                          </span>
                          User is typing...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messageEndRef} />
                </div>
              </div>

              <footer className="border-t border-border bg-card p-4 sm:p-5">
                {statusMessage && <div className="mb-3 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{statusMessage}</div>}

                {draftAttachments.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-3">
                    {draftAttachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 px-3 py-2">
                        {attachment.kind === "image" && attachment.previewUrl ? (
                          <img src={attachment.previewUrl} alt={attachment.name} className="h-10 w-10 rounded-xl object-cover" />
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

                        <button type="button" onClick={() => removeAttachment(attachment.id)} className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground" aria-label={`Remove ${attachment.name}`}>
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-3 rounded-[1.5rem] border border-border bg-background p-3 shadow-sm">
                  <button type="button" className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary" aria-label="Add emoji">
                    <SmilePlus className="h-4 w-4" />
                  </button>

                  <label className="mb-1 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary" aria-label="Attach file">
                    <Paperclip className="h-4 w-4" />
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={(event) => {
                        handleAttachments(event.target.files);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>

                  <div className="flex-1">
                    <textarea
                      value={draft}
                      onChange={(event) => handleDraftChange(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          sendMessage();
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
                    onClick={sendMessage}
                    className={`mb-1 inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r ${theme.accent} px-5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-95`}
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
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Pick a thread from the left to continue the conversation.</p>
              </div>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
