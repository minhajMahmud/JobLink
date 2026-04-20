import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Briefcase, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminJobs } from "@/data/adminMockData";
import { adminService } from "@/modules/admin/services/adminService";
import { useAdminPagination } from "@/modules/admin/hooks/useAdminPagination";
import type { ModerationJobRecord } from "@/modules/admin/types";
import { toast } from "sonner";

const statusStyles: Record<ModerationJobRecord["status"], string> = {
  Approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Rejected: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  Removed: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function JobModerationTab() {
  const [jobs, setJobs] = useState<ModerationJobRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { page, limit, total, totalPages, setTotal, goNext, goPrev } = useAdminPagination(1, 8);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await adminService.getJobs({ page, limit, query: search, status: statusFilter });
        setJobs(response.data);
        setTotal(response.meta.total);
      } catch {
        const fallback: ModerationJobRecord[] = adminJobs.map((j) => ({
          id: j.id,
          title: j.title,
          company_name: j.company,
          status: j.status === "active" ? "Approved" : j.status === "flagged" ? "Pending" : "Removed",
          spam_score: j.reports > 0 ? 70 + j.reports : 10,
        }));

        const filteredFallback = fallback.filter((j) => {
          const matchesSearch =
            !search ||
            j.title.toLowerCase().includes(search.toLowerCase()) ||
            j.company_name.toLowerCase().includes(search.toLowerCase());
          const matchesStatus = statusFilter === "all" || j.status === statusFilter;
          return matchesSearch && matchesStatus;
        });

        setJobs(filteredFallback.slice((page - 1) * limit, page * limit));
        setTotal(filteredFallback.length);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [page, limit, search, statusFilter, setTotal]);

  const visible = useMemo(() => jobs, [jobs]);

  const update = async (id: string, status: ModerationJobRecord["status"]) => {
    try {
      await adminService.moderateJob(id, status === "Removed" ? "Removed" : status === "Approved" ? "Approved" : "Rejected");
    } catch {
      // offline fallback
    }
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
    toast.success(status === "Removed" ? "Job removed" : status === "Rejected" ? "Job rejected" : "Job approved");
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">Job moderation</h2>
        <p className="text-sm text-muted-foreground">Review flagged job listings before they reach candidates.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs, companies, suspicious postings..."
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Removed">Removed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {loading && (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">Loading moderation queue...</div>
        )}
        {!loading && visible.map((j) => (
          <div key={j.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-semibold text-foreground">{j.title}</h3>
                  <Badge variant="outline" className={`${statusStyles[j.status]}`}>{j.status}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {j.company_name}</span>
                  <span>Spam score {j.spam_score}/100</span>
                </div>
                {j.spam_score > 75 && (
                  <div className="mt-3 inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" /> High-risk suspicious listing
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {j.status !== "Removed" && (
                  <Button size="sm" variant="outline" onClick={() => update(j.id, "Approved")}>Approve</Button>
                )}
                {j.status !== "Removed" && (
                  <Button size="sm" variant="outline" onClick={() => update(j.id, "Rejected")}>Reject</Button>
                )}
                {j.status !== "Removed" && (
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => update(j.id, "Removed")}>
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {!loading && visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No jobs in this view.
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
