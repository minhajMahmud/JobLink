import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, CheckAll, Trash2 } from "lucide-react";
import { useNotifications, categoryMeta } from "@/features/notifications/context/NotificationsContext";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const handleNotificationClick = (id: string, href?: string) => {
    markAsRead(id);
    if (href) {
      navigate(href);
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-display text-foreground">Notifications</h1>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
              {unreadCount} new
            </span>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card shadow-card p-12 text-center">
          <p className="text-muted-foreground">No notifications yet. You're all caught up!</p>
        </div>
      ) : (
        <>
          {unreadNotifications.length > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <CheckAll className="h-4 w-4" />
                Mark all as read
              </Button>
              <Button
                onClick={clearAll}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear all
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {/* Unread notifications */}
            {unreadNotifications.length > 0 && (
              <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden divide-y divide-border">
                <div className="px-4 py-2 bg-primary/5 text-xs font-semibold text-muted-foreground uppercase">
                  New
                </div>
                {unreadNotifications.map((notification, idx) => {
                  const meta = categoryMeta[notification.category];
                  const Icon = meta.icon;

                  return (
                    <motion.button
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => handleNotificationClick(notification.id, notification.href)}
                      className="w-full text-left flex items-start gap-4 p-4 hover:bg-primary/5 transition-colors cursor-pointer group"
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">{notification.description}</p>
                        <p className="text-xs text-muted-foreground/70 mt-2">{notification.time}</p>
                      </div>
                      {notification.priority === "high" && (
                        <div className="h-2 w-2 rounded-full bg-destructive shrink-0 mt-2" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Read notifications */}
            {notifications.filter((n) => n.read).length > 0 && (
              <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden divide-y divide-border opacity-60">
                <div className="px-4 py-2 bg-secondary/10 text-xs font-semibold text-muted-foreground uppercase">
                  Earlier
                </div>
                {notifications
                  .filter((n) => n.read)
                  .map((notification, idx) => {
                    const meta = categoryMeta[notification.category];
                    const Icon = meta.icon;

                    return (
                      <motion.button
                        key={notification.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (unreadNotifications.length + idx) * 0.02 }}
                        onClick={() => handleNotificationClick(notification.id, notification.href)}
                        className="w-full text-left flex items-start gap-4 p-4 hover:bg-secondary/10 transition-colors cursor-pointer group"
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-sm text-foreground/70 group-hover:text-foreground transition-colors line-clamp-2">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-1">{notification.time}</p>
                        </div>
                        <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-2" />
                      </motion.button>
                    );
                  })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
