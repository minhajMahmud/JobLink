import { Heart, UserPlus, MessageCircle, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

const notifications = [
  { id: 1, icon: Heart, color: "text-destructive", bg: "bg-destructive/10", text: "Sarah Chen liked your post", time: "2m ago" },
  { id: 2, icon: UserPlus, color: "text-primary", bg: "bg-primary/10", text: "James Wilson wants to connect", time: "15m ago" },
  { id: 3, icon: MessageCircle, color: "text-accent", bg: "bg-accent/10", text: "Emily Davis commented on your post", time: "1h ago" },
  { id: 4, icon: Briefcase, color: "text-warning", bg: "bg-warning/10", text: "New job matching your profile: Senior Frontend Engineer", time: "3h ago" },
  { id: 5, icon: Heart, color: "text-destructive", bg: "bg-destructive/10", text: "Michael Park liked your comment", time: "5h ago" },
];

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold font-display text-foreground">Notifications</h1>
      <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden divide-y divide-border">
        {notifications.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${n.bg}`}>
              <n.icon className={`h-5 w-5 ${n.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{n.text}</p>
              <p className="text-xs text-muted-foreground">{n.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
