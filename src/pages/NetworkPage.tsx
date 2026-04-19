import { UserPlus, UserCheck } from "lucide-react";
import { users } from "@/data/mockData";
import { useState } from "react";
import { motion } from "framer-motion";

export default function NetworkPage() {
  const [connected, setConnected] = useState<Set<string>>(new Set());

  const toggleConnect = (id: string) => {
    setConnected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">My Network</h1>
        <p className="mt-1 text-sm text-muted-foreground">Grow your professional connections</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {users.slice(1).map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-card text-center"
          >
            <img src={user.avatar} alt={user.name} className="mx-auto h-16 w-16 rounded-full object-cover" />
            <h3 className="mt-3 text-sm font-semibold font-display text-foreground">{user.name}</h3>
            <p className="text-xs text-muted-foreground">{user.title}</p>
            <p className="text-xs text-muted-foreground">{user.company}</p>
            <p className="mt-2 text-xs text-muted-foreground">{user.connections} connections</p>
            <button
              onClick={() => toggleConnect(user.id)}
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                connected.has(user.id)
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
            >
              {connected.has(user.id) ? (
                <><UserCheck className="h-4 w-4" /> Connected</>
              ) : (
                <><UserPlus className="h-4 w-4" /> Connect</>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
