import { useEffect, useState } from "react";
import { UserPlus, UserCheck, Loader2, Users, UserX, Clock } from "lucide-react";
import { motion } from "framer-motion";
import {
  getSuggestions,
  getConnections,
  getPendingRequests,
  sendConnectionRequest,
  acceptConnectionRequest,
  removeConnection,
  type NetworkUser,
} from "@/features/network/api/networkApi";

export type NetworkTab = "suggestions" | "connections" | "pending";

export default function NetworkPage() {
  const [suggestions, setSuggestions] = useState<NetworkUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<NetworkUser[]>([]);
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [connections, setConnections] = useState<NetworkUser[]>([]);
  const [activeTab, setActiveTab] = useState<NetworkTab>("suggestions");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      getSuggestions(20).catch(() => ({ success: false, data: [] })),
      getConnections().catch(() => ({ success: false, data: [] })),
      getPendingRequests().catch(() => ({ success: false, data: [] })),
    ]).then(([suggestionsRes, connectionsRes, pendingRes]) => {
      if (!cancelled) {
        if (suggestionsRes.success) {
          setSuggestions(suggestionsRes.data);
        }
        if (connectionsRes.success) {
          setConnections(connectionsRes.data);
          const connectedSet = new Set<string>();
          connectionsRes.data.forEach(c => connectedSet.add(c.id));
          setConnected(connectedSet);
        }
        if (pendingRes.success) {
          setPendingRequests(pendingRes.data);
          const pendingSet = new Set<string>();
          pendingRes.data.forEach(p => pendingSet.add(p.id));
          setPending(pendingSet);
        }
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const toggleConnect = async (userId: string) => {
    setActionLoading(userId);
    try {
      if (connected.has(userId)) {
        await removeConnection(userId).catch(() => { });
        setConnected((prev) => { const n = new Set(prev); n.delete(userId); return n; });
        setPending((prev) => { const n = new Set(prev); n.delete(userId); return n; });
      } else {
        const res = await sendConnectionRequest(userId).catch(() => ({ success: true, status: "pending" }));
        if (res.status === "accepted") {
          setConnected((prev) => new Set([...prev, userId]));
        } else {
          setPending((prev) => new Set([...prev, userId]));
        }
      }
    } finally {
      setActionLoading(null);
    }
  };

  const acceptRequest = async (userId: string) => {
    setActionLoading(userId);
    try {
      await acceptConnectionRequest(userId);
      setPendingRequests((prev) => prev.filter((u) => u.id !== userId));
      setConnected((prev) => new Set([...prev, userId]));
      setConnections((prev) => {
        const user = pendingRequests.find((u) => u.id === userId);
        return user ? [...prev, user] : prev;
      });
    } finally {
      setActionLoading(null);
    }
  };

  const declineRequest = async (userId: string) => {
    setActionLoading(userId);
    try {
      await removeConnection(userId);
      setPendingRequests((prev) => prev.filter((u) => u.id !== userId));
      setPending((prev) => { const n = new Set(prev); n.delete(userId); return n; });
    } finally {
      setActionLoading(null);
    }
  };

  const tabs: { key: NetworkTab; label: string; count?: number }[] = [
    { key: "suggestions", label: "Suggestions" },
    { key: "pending", label: "Pending Requests", count: pendingRequests.length },
    { key: "connections", label: "Connections", count: connections.length },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">My Network</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your professional connections and requests</p>
        </div>
        <div className="flex rounded-xl bg-secondary/50 p-1 w-full sm:w-fit overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 sm:flex-none rounded-lg px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  tab.key === "pending" && tab.count > 0
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-secondary text-muted-foreground"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 animate-pulse">
              <div className="mx-auto h-16 w-16 rounded-full bg-secondary" />
              <div className="mt-3 mx-auto h-3 w-24 rounded bg-secondary" />
              <div className="mt-2 mx-auto h-2 w-32 rounded bg-secondary" />
              <div className="mt-4 h-10 w-full rounded-xl bg-secondary" />
            </div>
          ))}
        </div>
      ) : activeTab === "suggestions" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((user, i) => {
              const isConnected = connected.has(user.id);
              const isPending = pending.has(user.id);
              const isActing = actionLoading === user.id;

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-card text-center transition-all hover:shadow-lg hover:border-primary/20"
                >
                  <div>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="mx-auto h-16 w-16 rounded-full object-cover border-2 border-background shadow-sm"
                    />
                    <h3 className="mt-3 text-sm font-bold font-display text-foreground line-clamp-1">
                      {user.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[32px]">{user.title}</p>
                    {user.company && (
                      <p className="text-[11px] font-medium text-foreground mt-1 bg-secondary/50 inline-block px-2 py-0.5 rounded-full">{user.company}</p>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-[11px] text-muted-foreground mb-3 flex justify-center items-center gap-1">
                      <Users className="w-3 h-3" /> {user.connections} connections
                    </p>
                    <button
                      onClick={() => toggleConnect(user.id)}
                      disabled={isActing}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-bold transition-all disabled:opacity-60 ${
                        isConnected
                          ? "bg-secondary text-secondary-foreground"
                          : isPending
                            ? "bg-secondary/70 text-muted-foreground"
                            : "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
                      }`}
                    >
                      {isActing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isConnected ? (
                        <><UserCheck className="h-4 w-4" /> Connected</>
                      ) : isPending ? (
                        <><UserPlus className="h-4 w-4" /> Pending</>
                      ) : (
                        <><UserPlus className="h-4 w-4" /> Connect</>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {suggestions.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground font-display mb-1">No suggestions available</h3>
              <p className="text-sm text-muted-foreground">Check back later for more professional connections.</p>
            </div>
          )}
        </>
      ) : activeTab === "pending" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map((user, i) => {
              const isActing = actionLoading === user.id;
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col justify-between rounded-2xl border border-amber-200/50 dark:border-amber-800/30 bg-card p-5 shadow-card text-center transition-all hover:shadow-lg"
                >
                  <div className="relative">
                    <div className="absolute -top-1 -right-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    </div>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="mx-auto h-16 w-16 rounded-full object-cover border-2 border-background shadow-sm"
                    />
                    <h3 className="mt-3 text-sm font-bold font-display text-foreground line-clamp-1">
                      {user.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[32px]">{user.title}</p>
                    {user.company && (
                      <p className="text-[11px] font-medium text-foreground mt-1 bg-secondary/50 inline-block px-2 py-0.5 rounded-full">{user.company}</p>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => acceptRequest(user.id)}
                      disabled={isActing}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:opacity-60"
                    >
                      {isActing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserCheck className="h-4 w-4" /> Accept</>}
                    </button>
                    <button
                      onClick={() => declineRequest(user.id)}
                      disabled={isActing}
                      title="Decline request"
                      className="flex items-center justify-center gap-2 rounded-xl bg-destructive/10 py-2 px-3 text-sm font-bold text-destructive transition-all hover:bg-destructive/20 disabled:opacity-60"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {pendingRequests.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground font-display mb-1">No pending requests</h3>
              <p className="text-sm text-muted-foreground">When someone sends you a connection request, it will appear here.</p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {connections.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-card text-center transition-all hover:shadow-lg hover:border-primary/20"
              >
                <div>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="mx-auto h-16 w-16 rounded-full object-cover border-2 border-background shadow-sm"
                  />
                  <h3 className="mt-3 text-sm font-bold font-display text-foreground line-clamp-1">
                    {user.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[32px]">{user.title}</p>
                </div>
                <div className="mt-4">
                  <p className="text-[11px] text-muted-foreground mb-3 flex justify-center items-center gap-1">
                    <Users className="w-3 h-3" /> Connected
                  </p>
                  <button
                    onClick={() => {
                      setActionLoading(user.id);
                      removeConnection(user.id).then(() => {
                        setConnections(connections.filter(c => c.id !== user.id));
                        setConnected(prev => { const n = new Set(prev); n.delete(user.id); return n; });
                        setActionLoading(null);
                      });
                    }}
                    disabled={actionLoading === user.id}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-bold transition-all disabled:opacity-60 bg-red-500/10 text-red-600 hover:bg-red-500/20"
                  >
                    {actionLoading === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove Connection"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          {connections.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground font-display mb-1">No connections yet</h3>
              <p className="text-sm text-muted-foreground">Start networking by connecting with suggested professionals.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}