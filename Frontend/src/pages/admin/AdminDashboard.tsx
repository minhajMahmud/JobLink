import { Activity, BarChart3, Briefcase, Building2, FileText, Flag, LayoutDashboard, LogOut, ScrollText, Search, Settings, ShieldAlert, ShieldCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import SpamDetectionTab from "@/components/admin/SpamDetectionTab";
import AdminSidebar, { type AdminNavItem, type AdminStatItem } from "@/components/admin/AdminSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const headerStats = [
  { label: "Total users", value: "12,480", icon: Users },
  { label: "Active jobs", value: "684", icon: Briefcase },
  { label: "Open reports", value: "14", icon: Flag },
  { label: "Moderation actions", value: "88", icon: ShieldCheck },
];

const navItems: AdminNavItem[] = [
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Overview", description: "Home summary" },
  { value: "analytics", label: "Analytics", icon: BarChart3, section: "Overview", description: "Growth and trends" },
  { value: "users", label: "Users", icon: Users, section: "Management", description: "Accounts and roles" },
  { value: "employers", label: "Employers", icon: Building2, section: "Management", description: "Company verification" },
  { value: "jobs", label: "Jobs", icon: Briefcase, section: "Management", description: "Post moderation" },
  { value: "posts", label: "Posts", icon: FileText, section: "Management", description: "Content review" },
  { value: "reports", label: "Reports", icon: Flag, section: "Management", description: "Handle escalations" },
  { value: "spam", label: "Spam", icon: ShieldAlert, section: "Insights", description: "Risk signals" },
  { value: "audit", label: "Audit logs", icon: ScrollText, section: "Insights", description: "Immutable history" },
  { value: "settings", label: "Settings", icon: Settings, section: "System", description: "Access and rules" },
];

const contentByTab = {
  dashboard: null,
  analytics: <PlatformAnalyticsTab />,
  users: <UserManagementTab />,
  employers: <EmployerManagementTab />,
  jobs: <JobModerationTab />,
  posts: <PostModerationTab />,
  reports: <ReportsTab />,
  spam: <SpamDetectionTab />,
  audit: <AuditLogsTab />,
  settings: <RolePermissionsTab />,
};

type AdminTab = keyof typeof contentByTab;

function DashboardHome({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const summaryCards = [
    { label: "Users", value: "12.4k", accent: "from-primary/10 to-primary/5" },
    { label: "Jobs", value: "684", accent: "from-emerald-500/10 to-emerald-500/5" },
    { label: "Reports", value: "14 open", accent: "from-amber-500/10 to-amber-500/5" },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-card">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Dashboard</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-foreground">Welcome back, admin</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          Use the vertical sidebar to jump between management, insight, and system tools. The layout is built for fast scanning, minimal clutter, and crisp dashboard workflows.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" onClick={() => onNavigate("users")} className="rounded-xl">
            Review users
          </Button>
          <Button type="button" variant="outline" onClick={() => onNavigate("reports")} className="rounded-xl">
            Open reports
          </Button>
          <Button type="button" variant="outline" onClick={() => onNavigate("analytics")} className="rounded-xl">
            View analytics
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <div key={card.label} className={`rounded-3xl border border-border bg-gradient-to-br ${card.accent} p-5 shadow-card`}>
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <p className="mt-4 font-display text-3xl font-bold text-foreground">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-xl font-semibold text-foreground">Today's focus</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="rounded-2xl border border-border bg-background p-4">Resolve open reports before the next moderation sweep.</li>
            <li className="rounded-2xl border border-border bg-background p-4">Verify new employers and keep spam scoring clean.</li>
            <li className="rounded-2xl border border-border bg-background p-4">Check analytics for traffic spikes or engagement dips.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-xl font-semibold text-foreground">Quick actions</h3>
          <div className="mt-4 space-y-3">
            {[
              { label: "Open user management", tab: "users" as AdminTab },
              { label: "Inspect job queue", tab: "jobs" as AdminTab },
              { label: "Adjust settings", tab: "settings" as AdminTab },
            ].map((action) => (
              <button
                key={action.tab}
                type="button"
                onClick={() => onNavigate(action.tab)}
                className="flex w-full items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <span>{action.label}</span>
                <span className="text-muted-foreground">→</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const stats = headerStats as AdminStatItem[];

  const activeContent = useMemo(() => {
    if (activeTab === "dashboard") {
      return <DashboardHome onNavigate={setActiveTab} />;
    }

    return contentByTab[activeTab];
  }, [activeTab]);

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto grid w-full max-w-[1600px] gap-4 lg:grid-cols-[auto_1fr]">
        <AdminSidebar
          items={navItems}
          stats={stats}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as AdminTab)}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
        />

        <main className="space-y-4">
          <section className="rounded-3xl border border-border bg-card p-4 shadow-card">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setMobileOpen(true)}
                  className="h-10 w-10 rounded-xl lg:hidden"
                  aria-label="Open navigation drawer"
                >
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
                <div className="relative w-full xl:max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search users, companies, jobs, reports..." className="pl-10" />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-2">
                <NotificationsBell variant="panel" />
                <img src={user?.avatar} alt={user?.name} className="h-10 w-10 rounded-xl object-cover" />
                <div className="pr-2">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.role.replace("_", " ")}</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-4 shadow-card sm:p-6">
            {activeContent}
          </section>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5" /> All admin actions are logged in the immutable audit trail
          </div>
        </main>
      </div>
    </div>
  );
}
