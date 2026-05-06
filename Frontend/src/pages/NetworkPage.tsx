import { useEffect, useState } from "react";
import { UserPlus, UserCheck, Loader2, Users } from "lucide-react";
import { motion } from "framer-motion";
import {
  getSuggestions,
  getConnections,
  sendConnectionRequest,
  removeConnection,
  type NetworkUser,
} from "@/features/network/api/networkApi";

export default function NetworkPage() {
  const [suggestions, setSuggestions] = useState<NetworkUser[]>([]);
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [connections, setConnections] = useState<NetworkUser[]>([]);
  const [activeTab, setActiveTab] = useState<"suggestions" | "connections">("suggestions");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      getSuggestions(20).catch(() => ({ success: false, data: [] })),
      getConnections().catch(() => ({ success: false, data: [] }))
    ]).then(([suggestionsRes, connectionsRes]) => {
      if (!cancelled) {
        if (suggestionsRes.success) {
          setSuggestions(suggestionsRes.data);
        }
        if (connectionsRes.success) {
          setConnections(connectionsRes.data);
          // Mark existing connections
          const connectedSet = new Set<string>();
          connectionsRes.data.forEach(c => connectedSet.add(c.id));
          setConnected(connectedSet);
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">My Network</h1>
          <p className="mt-1 text-sm text-muted-foreground">Grow your professional connections</p>
        </div>
        <div className="flex rounded-xl bg-secondary/50 p-1 w-full sm:w-fit">
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`flex-1 sm:flex-none rounded-lg px-4 py-2 text-sm font-semibold transition-all ${activeTab === "suggestions"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Suggestions
          </button>
          <button
            onClick={() => setActiveTab("connections")}
            className={`flex-1 sm:flex-none rounded-lg px-4 py-2 text-sm font-semibold transition-all ${activeTab === "connections"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Connections ({connections.length})
          </button>
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
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-bold transition-all disabled:opacity-60 ${isConnected
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
