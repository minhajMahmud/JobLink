import { Activity, BarChart3, Briefcase, Building2, FileText, Flag, LogOut, ScrollText, ShieldCheck, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import NotificationsBell from "@/components/notifications/NotificationsBell";
import UserManagementTab from "@/components/admin/UserManagementTab";
import EmployerManagementTab from "@/components/admin/EmployerManagementTab";
import PostModerationTab from "@/components/admin/PostModerationTab";
import JobModerationTab from "@/components/admin/JobModerationTab";
import PlatformAnalyticsTab from "@/components/admin/PlatformAnalyticsTab";
import ReportsTab from "@/components/admin/ReportsTab";
import AuditLogsTab from "@/components/admin/AuditLogsTab";
import RolePermissionsTab from "@/components/admin/RolePermissionsTab";

const headerStats = [
  { label: "Total users", value: "12,480", icon: Users },
  { label: "Active jobs", value: "684", icon: Briefcase },
  { label: "Open reports", value: "14", icon: Flag },
  { label: "Moderation actions", value: "88", icon: ShieldCheck },
];

const tabs = [
  { value: "analytics", label: "Analytics", icon: BarChart3, content: <PlatformAnalyticsTab /> },
  { value: "users", label: "Users", icon: Users, content: <UserManagementTab /> },
  { value: "employers", label: "Employers", icon: Building2, content: <EmployerManagementTab /> },
  { value: "posts", label: "Posts", icon: FileText, content: <PostModerationTab /> },
  { value: "jobs", label: "Jobs", icon: Briefcase, content: <JobModerationTab /> },
  { value: "reports", label: "Reports", icon: Flag, content: <ReportsTab /> },
  { value: "audit", label: "Audit logs", icon: ScrollText, content: <AuditLogsTab /> },
  { value: "rbac", label: "Roles", icon: ShieldCheck, content: <RolePermissionsTab /> },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-border bg-card p-6 shadow-card sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Admin Panel</p>
              <h1 className="mt-3 font-display text-4xl font-bold text-foreground">Platform command center</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Manage users, employers, content moderation, reports, audit history, and role-based access — all in one place.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
              <img src={user?.avatar} alt={user?.name} className="h-12 w-12 rounded-2xl object-cover" />
              <div>
                <p className="font-medium text-foreground">{user?.name}</p>
                <p className="text-sm text-muted-foreground">Platform administrator</p>
              </div>
              <NotificationsBell variant="panel" />
              <button
                type="button"
                onClick={logout}
                className="ml-2 inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {headerStats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-5 font-display text-3xl font-bold text-foreground">{s.value}</p>
              </div>
            );
          })}
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-4 shadow-card sm:p-6">
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-secondary/50 p-1">
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <TabsTrigger key={t.value} value={t.value} className="gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {tabs.map((t) => (
              <TabsContent key={t.value} value={t.value} className="mt-6">
                {t.content}
              </TabsContent>
            ))}
          </Tabs>
        </section>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5" /> All admin actions are logged in the immutable audit trail
        </div>
      </div>
    </div>
  );
}
