import { useState } from "react";
import { CheckCircle2, Flag, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminReports, type AdminReport } from "@/data/adminMockData";
import { toast } from "sonner";

const priorityStyles: Record<AdminReport["priority"], string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  low: "bg-muted text-muted-foreground border-border",
};

const statusStyles: Record<AdminReport["status"], string> = {
  open: "bg-destructive/10 text-destructive border-destructive/20",
  investigating: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  resolved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

export default function ReportsTab() {
  const [reports, setReports] = useState<AdminReport[]>(adminReports);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const visible = reports.filter((r) => {
    const matchesSearch = !search || r.targetTitle.toLowerCase().includes(search.toLowerCase()) || r.reason.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = (id: string, status: AdminReport["status"]) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(`Report ${status}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Report handling</h2>
          <p className="text-sm text-muted-foreground">Triage, investigate, and resolve user reports.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> AI-assisted triage enabled
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search reports…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {visible.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Flag className="h-4 w-4 text-destructive" />
                  <h3 className="font-medium text-foreground">{r.targetTitle}</h3>
                  <Badge variant="secondary" className="capitalize">{r.type}</Badge>
                  <Badge variant="outline" className={`capitalize ${priorityStyles[r.priority]}`}>{r.priority} priority</Badge>
                  <Badge variant="outline" className={`capitalize ${statusStyles[r.status]}`}>{r.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-foreground">{r.reason}</p>
                <p className="mt-1 text-xs text-muted-foreground">Reported by {r.reportedBy} · {r.reportedAt}</p>
              </div>
              <div className="flex gap-2">
                {r.status === "open" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "investigating")}>Investigate</Button>
                )}
                {r.status !== "resolved" && (
                  <Button size="sm" onClick={() => updateStatus(r.id, "resolved")}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No reports match these filters.
          </div>
        )}
      </div>
    </div>
  );
}
