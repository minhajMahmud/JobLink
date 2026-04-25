import { useCallback, useMemo } from "react";
import { useNotifications, categoryMeta, type NotificationCategory } from "@/features/notifications/context/NotificationsContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

const deliveryMethods = [
  { id: "email", label: "Email", description: "Receive notifications via email" },
  { id: "push", label: "Push", description: "Desktop push notifications" },
  { id: "inApp", label: "In-App", description: "See in notification center" },
];

export default function NotificationPreferencesPage() {
  const { preferences, updatePreference } = useNotifications();

  const categories = useMemo(() => {
    return Object.keys(categoryMeta) as NotificationCategory[];
  }, []);

  const handleToggle = useCallback(
    (category: NotificationCategory, deliveryMethod: "email" | "push" | "inApp") => {
      const current = preferences[category][deliveryMethod];
      updatePreference(category, deliveryMethod, !current);
    },
    [preferences, updatePreference],
  );

  const categoriesByType = {
    engagement: ["profile", "connection"] as NotificationCategory[],
    messaging: ["message"] as NotificationCategory[],
    jobs: ["job", "application", "interview", "applicant"] as NotificationCategory[],
    moderation: ["report", "spam", "moderation", "verification"] as NotificationCategory[],
    system: ["system"] as NotificationCategory[],
  };

  const renderCategoryGroup = (title: string, categoryList: NotificationCategory[], groupIdx: number) => {
    return (
      <motion.div
        key={title}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: groupIdx * 0.1 }}
        className="space-y-3"
      >
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">{title}</h3>
        <div className="space-y-2">
          {categoryList.map((category) => {
            const meta = categoryMeta[category];
            const pref = preferences[category];
            const Icon = meta.icon;
            const allDisabled = !pref.email && !pref.push && !pref.inApp;

            return (
              <Card
                key={category}
                className="p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{meta.label}</p>
                        {allDisabled && (
                          <Badge variant="secondary" className="text-xs">
                            Disabled
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Control how you receive {meta.label.toLowerCase()} notifications
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {deliveryMethods.map((method) => {
                    const isEnabled = pref[method.id as "email" | "push" | "inApp"];
                    return (
                      <div
                        key={method.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          isEnabled
                            ? "border-primary/50 bg-primary/5"
                            : "border-border/50 bg-secondary/30"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{method.label}</p>
                          <p className="text-xs text-muted-foreground/70">{method.description}</p>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() =>
                            handleToggle(category, method.id as "email" | "push" | "inApp")
                          }
                          className="ml-2 shrink-0"
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </motion.div>
    );
  };

  const totalEnabled = categories.reduce((sum, cat) => {
    const pref = preferences[cat];
    return sum + (pref.email ? 1 : 0) + (pref.push ? 1 : 0) + (pref.inApp ? 1 : 0);
  }, 0);

  const totalPossible = categories.length * 3;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">Notification Preferences</h1>
        <p className="text-muted-foreground mt-2">
          Control how and when you receive notifications across all channels
        </p>
      </div>

      {/* Quick Stats */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Notification Channels Active</p>
            <p className="text-3xl font-bold text-foreground">
              {totalEnabled} <span className="text-lg font-normal text-muted-foreground">/ {totalPossible}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Enabled Categories</p>
            <p className="text-3xl font-bold text-foreground">
              {categories.filter((cat) => {
                const pref = preferences[cat];
                return pref.email || pref.push || pref.inApp;
              }).length}
              <span className="text-lg font-normal text-muted-foreground"> / {categories.length}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Preference Groups */}
      <div className="space-y-8">
        {Object.entries(categoriesByType).map(([groupKey, categoryList], idx) => {
          const groupTitle =
            groupKey === "engagement"
              ? "Engagement & Network"
              : groupKey === "messaging"
                ? "Messages"
                : groupKey === "jobs"
                  ? "Job & Career"
                  : groupKey === "moderation"
                    ? "Safety & Moderation"
                    : "System & Updates";
          return renderCategoryGroup(groupTitle, categoryList, idx);
        })}
      </div>

      {/* Info Box */}
      <Card className="p-4 border-accent/50 bg-accent/5">
        <p className="text-sm text-foreground/80">
          <strong>💡 Tip:</strong> Keep "In-App" enabled for important notifications so you don't miss critical updates. Use Email
          and Push for notifications you want to receive outside the app.
        </p>
      </Card>
    </div>
  );
}
