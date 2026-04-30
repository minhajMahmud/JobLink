import { useEffect, useState } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  getSuggestions,
  sendConnectionRequest,
  removeConnection,
  type NetworkUser,
} from "@/features/network/api/networkApi";
import { users } from "@/data/mockData";

export default function NetworkPage() {
  const [suggestions, setSuggestions] = useState<NetworkUser[]>([]);
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getSuggestions(20)
      .then((res) => {
        if (!cancelled) {
          if (res.success && res.data.length > 0) {
            setSuggestions(res.data);
          } else {
            // Fallback to mock users
            setSuggestions(
              users.slice(1).map((u) => ({
                id: u.id,
                name: u.name,
                title: u.title ?? "",
                avatar: u.avatar,
                company: u.company ?? "",
                connections: u.connections,
                role: u.role,
              }))
            );
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSuggestions(
            users.slice(1).map((u) => ({
              id: u.id,
              name: u.name,
              title: u.title ?? "",
              avatar: u.avatar,
              company: u.company ?? "",
              connections: u.connections,
              role: u.role,
            }))
          );
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

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
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">My Network</h1>
        <p className="mt-1 text-sm text-muted-foreground">Grow your professional connections</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 animate-pulse">
              <div className="mx-auto h-16 w-16 rounded-full bg-secondary" />
              <div className="mt-3 mx-auto h-3 w-24 rounded bg-secondary" />
              <div className="mt-2 mx-auto h-2 w-32 rounded bg-secondary" />
              <div className="mt-3 h-10 w-full rounded-xl bg-secondary" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
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
                className="rounded-2xl border border-border bg-card p-5 shadow-card text-center"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="mx-auto h-16 w-16 rounded-full object-cover"
                />
                <h3 className="mt-3 text-sm font-semibold font-display text-foreground">
                  {user.name}
                </h3>
                <p className="text-xs text-muted-foreground">{user.title}</p>
                {user.company && (
                  <p className="text-xs text-muted-foreground">{user.company}</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {user.connections} connections
                </p>
                <button
                  onClick={() => toggleConnect(user.id)}
                  disabled={isActing}
                  className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all disabled:opacity-60 ${isConnected
                      ? "bg-secondary text-secondary-foreground"
                      : isPending
                        ? "bg-secondary/70 text-muted-foreground"
                        : "bg-primary text-primary-foreground hover:opacity-90"
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
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && suggestions.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-card">
          <p className="text-sm text-muted-foreground">No suggestions available right now.</p>
        </div>
      )}
    </div>
  );
}
