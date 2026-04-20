import { useEffect, useState } from "react";
import { CheckCircle2, Flag, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminReports } from "@/data/adminMockData";
import { adminService } from "@/modules/admin/services/adminService";
import { useAdminPagination } from "@/modules/admin/hooks/useAdminPagination";
import type { AdminReportRecord } from "@/modules/admin/types";
import { toast } from "sonner";

const priorityStyles: Record<AdminReportRecord["priority"], string> = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Low: "bg-muted text-muted-foreground border-border",
};

const statusStyles: Record<AdminReportRecord["status"], string> = {
  Open: "bg-destructive/10 text-destructive border-destructive/20",
  Investigating: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Resolved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Dismissed: "bg-muted text-muted-foreground border-border",
};

const statusLabel: Record<AdminReportRecord["status"], string> = {
  Open: "Open",
  Investigating: "তদন্তাধীন",
  Resolved: "Resolved",
  Dismissed: "Dismissed",
};

export default function ReportsTab() {
  const [reports, setReports] = useState<AdminReportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { page, limit, total, totalPages, setTotal, goNext, goPrev } = useAdminPagination(1, 10);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await adminService.getReports({ page, limit, query: search, status: statusFilter });
        setReports(response.data);
        setTotal(response.meta.total);
      } catch {
        const fallback: AdminReportRecord[] = adminReports.map((r) => ({
          id: r.id,
          category: r.type === "job" ? "fake_job" : r.type === "post" ? "spam" : r.type === "user" ? "abuse" : "other",
          entity_type: r.type,
          entity_id: r.id,
          details: r.reason,
          priority: r.priority === "high" ? "High" : r.priority === "medium" ? "Medium" : "Low",
          status: r.status === "open" ? "Open" : r.status === "investigating" ? "Investigating" : "Resolved",
        }));

        const filteredFallback = fallback.filter((r) => {
          const matchesSearch =
            !search ||
            r.details.toLowerCase().includes(search.toLowerCase()) ||
            r.category.toLowerCase().includes(search.toLowerCase());
          const matchesStatus = statusFilter === "all" || r.status === statusFilter;
          return matchesSearch && matchesStatus;
        });

        setReports(filteredFallback.slice((page - 1) * limit, page * limit));
        setTotal(filteredFallback.length);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [page, limit, search, statusFilter, setTotal]);

  const visible = reports.filter((r) => {
    const matchesSearch = !search || r.category.toLowerCase().includes(search.toLowerCase()) || r.details.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, status: AdminReportRecord["status"]) => {
    try {
      await adminService.resolveReport(id, status === "Open" ? "Investigating" : status, notes[id]);
    } catch {
      // fallback mode
    }
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(`Report marked as ${statusLabel[status]}`);
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
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Investigating">তদন্তাধীন</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {loading && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Loading reports...</div>
        )}
        {visible.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Flag className="h-4 w-4 text-destructive" />
                  <h3 className="font-medium text-foreground">{r.entity_type} #{r.entity_id}</h3>
                  <Badge variant="secondary" className="capitalize">{r.category}</Badge>
                  <Badge variant="outline" className={`capitalize ${priorityStyles[r.priority]}`}>{r.priority} priority</Badge>
                  <Badge variant="outline" className={`capitalize ${statusStyles[r.status]}`}>{statusLabel[r.status]}</Badge>
                </div>
                <p className="mt-2 text-sm text-foreground">{r.details}</p>
                <Textarea
                  value={notes[r.id] ?? ""}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                  placeholder="Add admin note..."
                  className="mt-3 min-h-[80px]"
                />
              </div>
              <div className="flex gap-2">
                {r.status === "Open" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "Investigating")}>Investigate</Button>
                )}
                {r.status !== "Resolved" && (
                  <Button size="sm" onClick={() => updateStatus(r.id, "Resolved")}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                  </Button>
                )}
                {r.status !== "Dismissed" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "Dismissed")}>Dismiss</Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {!loading && visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No reports match these filters.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages} • total {total}</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={goPrev} disabled={page <= 1}>Previous</Button>
          <Button size="sm" variant="outline" onClick={goNext} disabled={page >= totalPages}>Next</Button>
        </div>
      </div>
    </div>
  );
}
