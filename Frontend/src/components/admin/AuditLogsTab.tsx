import { useMemo, useState } from "react";
import { Activity, Filter, Search, ShieldAlert, User, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auditLogs, type AuditLog } from "@/data/adminMockData";

const categoryIcons: Record<AuditLog["category"], typeof Activity> = {
  auth: ShieldAlert,
  moderation: Activity,
  user: User,
  system: Wrench,
};

const categoryStyles: Record<AuditLog["category"], string> = {
  auth: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  moderation: "bg-destructive/10 text-destructive border-destructive/20",
  user: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  system: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

export default function AuditLogsTab() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const visible = useMemo(
    () =>
      auditLogs.filter((l) => {
        const matchesSearch =
          !search ||
          l.actor.toLowerCase().includes(search.toLowerCase()) ||
          l.action.toLowerCase().includes(search.toLowerCase()) ||
          l.target.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "all" || l.category === category;
        return matchesSearch && matchesCategory;
      }),
    [search, category],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Audit logs</h2>
          <p className="text-sm text-muted-foreground">Immutable record of administrative and system actions.</p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="h-3.5 w-3.5" /> {visible.length} entries
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search actor, action, or target…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="auth">Authentication</SelectItem>
            <SelectItem value="moderation">Moderation</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <ol className="divide-y divide-border">
          {visible.map((log) => {
            const Icon = categoryIcons[log.category];
            return (
              <li key={log.id} className="flex items-start gap-4 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{log.action}</p>
                    <Badge variant="outline" className={`capitalize ${categoryStyles[log.category]}`}>{log.category}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="text-foreground">{log.actor}</span> → {log.target}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{log.timestamp} · IP {log.ipAddress}</p>
                </div>
              </li>
            );
          })}
          {visible.length === 0 && (
            <li className="p-10 text-center text-sm text-muted-foreground">No log entries match these filters.</li>
          )}
        </ol>
      </div>
    </div>
  );
}
