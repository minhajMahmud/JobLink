import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, Users, Briefcase, ShieldCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminService } from "@/modules/admin/services/adminService";
import type { AdminAnalyticsResponse, SpamAlertRecord } from "@/modules/admin/types";
import { moderationTrend, platformGrowth, userRoleBreakdown } from "@/data/adminMockData";

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted-foreground))"];

export default function PlatformAnalyticsTab() {
  const [range, setRange] = useState("7d");
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(null);
  const [spamAlerts, setSpamAlerts] = useState<SpamAlertRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [analyticsResponse, alertsResponse] = await Promise.all([
          adminService.getAnalytics(range),
          adminService.getSpamAlerts(),
        ]);
        setAnalytics(analyticsResponse);
        setSpamAlerts(alertsResponse.alerts);
      } catch {
        setAnalytics({
          range,
          kpis: {
            total_users: 12480,
            total_employers: 358,
            total_jobs: 684,
            daily_active_users: 2480,
            monthly_active_users: 8720,
            revenue: 14350.4,
          },
          application_trends: moderationTrend.map((m) => ({ label: m.day, value: m.resolved + m.flagged })),
          user_growth: platformGrowth.map((g) => ({ label: g.month, users: g.users, employers: g.employers, jobs: g.jobs })),
        });
        setSpamAlerts([
          { entity_type: "post", entity_id: "p2", score: 92, risk_level: "High", reasons: ["repeated_links"] },
          { entity_type: "job", entity_id: "j2", score: 97, risk_level: "High", reasons: ["suspicious_contact"] },
        ]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [range]);

  const stats = useMemo(() => {
    if (!analytics) {
      return [] as Array<{ label: string; value: string; change: string; icon: typeof Users }>;
    }

    return [
      { label: "Monthly active users", value: analytics.kpis.monthly_active_users.toLocaleString(), change: `${range} window`, icon: Users },
      { label: "Active job posts", value: analytics.kpis.total_jobs.toLocaleString(), change: `Employers ${analytics.kpis.total_employers.toLocaleString()}`, icon: Briefcase },
      { label: "Moderation actions", value: String(spamAlerts.length), change: "Spam alerts detected", icon: ShieldCheck },
      { label: "Revenue", value: `$${analytics.kpis.revenue.toLocaleString()}`, change: "Monetization overview", icon: TrendingUp },
    ];
  }, [analytics, range, spamAlerts.length]);

  const growthData = analytics?.user_growth ?? platformGrowth.map((g) => ({ label: g.month, users: g.users, employers: g.employers, jobs: g.jobs }));
  const appTrendData = analytics?.application_trends ?? moderationTrend.map((m) => ({ label: m.day, value: m.resolved + m.flagged }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Platform analytics</h2>
          <p className="text-sm text-muted-foreground">Real-time visibility into growth, engagement, and moderation.</p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="sm:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7d</SelectItem>
            <SelectItem value="30d">Last 30d</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-4 font-display text-2xl font-bold text-foreground">{s.value}</p>
              <p className="mt-1 text-xs font-medium text-emerald-600">{s.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-2">
          <h3 className="font-display text-lg font-semibold text-foreground">Platform growth</h3>
          <p className="text-xs text-muted-foreground">Users, employers, and job posts over the last 6 months</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="employers" stroke="hsl(var(--accent))" strokeWidth={2} />
                <Line type="monotone" dataKey="jobs" stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-foreground">User breakdown</h3>
          <p className="text-xs text-muted-foreground">Distribution by role</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={userRoleBreakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={4}>
                  {userRoleBreakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold text-foreground">Application trend</h3>
        <p className="text-xs text-muted-foreground">Application activity for selected range</p>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={appTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Legend />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold text-foreground">Spam detection alerts</h3>
        <p className="text-xs text-muted-foreground">Rule-based + ML-based suspicious activity feed</p>
        <div className="mt-4 space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Loading alerts...</p>}
          {!loading && spamAlerts.map((alert) => (
            <div key={`${alert.entity_type}-${alert.entity_id}`} className="flex items-start justify-between rounded-xl border border-border bg-background p-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {alert.entity_type.toUpperCase()} #{alert.entity_id}
                </p>
                <p className="text-xs text-muted-foreground">Reasons: {alert.reasons.join(", ")}</p>
              </div>
              <Badge variant="outline" className={alert.risk_level === "High" ? "text-destructive border-destructive/40" : alert.risk_level === "Medium" ? "text-amber-600 border-amber-300" : "text-emerald-600 border-emerald-300"}>
                <AlertTriangle className="mr-1 h-3 w-3" /> {alert.risk_level} ({alert.score})
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
