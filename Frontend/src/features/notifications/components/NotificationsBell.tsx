import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { categoryMeta, useNotifications } from "@/features/notifications/context/NotificationsContext";

interface NotificationsBellProps {
  variant?: "header" | "panel";
}

export default function NotificationsBell({ variant = "panel" }: NotificationsBellProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const triggerClass =
    variant === "header"
      ? "relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      : "relative inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={triggerClass} aria-label={`Notifications (${unreadCount} unread)`}>
          <Bell className="h-4 w-4" />
          {variant === "panel" && <span className="hidden sm:inline">Notifications</span>}
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground ring-2 ring-card">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-0 sm:w-[26rem]">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="font-display text-base font-semibold text-foreground">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
            </p>
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={markAllAsRead} disabled={unreadCount === 0}>
                <CheckCheck className="h-3.5 w-3.5" /> Mark all
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-destructive hover:text-destructive" onClick={clearAll}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="max-h-[26rem]">
          {notifications.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Bell className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            </div>
          ) : (
            <ol className="divide-y divide-border">
              {notifications.map((n) => {
                const meta = categoryMeta[n.category];
                const Icon = meta.icon;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => markAsRead(n.id)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50 ${
                        !n.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-snug ${!n.read ? "font-semibold text-foreground" : "text-foreground"}`}>
                            {n.title}
                          </p>
                          {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{n.description}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{n.time}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
