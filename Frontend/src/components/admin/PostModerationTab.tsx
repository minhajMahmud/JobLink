import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, Search, Trash2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminPosts } from "@/data/adminMockData";
import { adminService } from "@/modules/admin/services/adminService";
import { useAdminPagination } from "@/modules/admin/hooks/useAdminPagination";
import type { ModerationPostRecord } from "@/modules/admin/types";
import { toast } from "sonner";

const statusStyles: Record<ModerationPostRecord["status"], string> = {
  Approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Rejected: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  Removed: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function PostModerationTab() {
  const [posts, setPosts] = useState<ModerationPostRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { page, limit, total, totalPages, setTotal, goNext, goPrev } = useAdminPagination(1, 8);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await adminService.getPosts({ page, limit, query: search, status: statusFilter });
        setPosts(response.data);
        setTotal(response.meta.total);
      } catch {
        const fallback: ModerationPostRecord[] = adminPosts.map((p) => ({
          id: p.id,
          author_name: p.author,
          content: p.content,
          status: p.status === "active" ? "Approved" : p.status === "flagged" ? "Pending" : "Removed",
          spam_score: p.spamScore,
          flagged_keywords:
            p.spamScore > 80
              ? ["suspicious link", "promotional spam"]
              : [],
        }));

        const filteredFallback = fallback.filter((p) => {
          const matchesSearch =
            !search ||
            p.author_name.toLowerCase().includes(search.toLowerCase()) ||
            p.content.toLowerCase().includes(search.toLowerCase());
          const matchesStatus = statusFilter === "all" || p.status === statusFilter;
          return matchesSearch && matchesStatus;
        });

        setPosts(filteredFallback.slice((page - 1) * limit, page * limit));
        setTotal(filteredFallback.length);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [page, limit, search, statusFilter, setTotal]);

  const update = async (id: string, status: ModerationPostRecord["status"]) => {
    try {
      await adminService.moderatePost(id, status === "Removed" ? "Removed" : status === "Approved" ? "Approved" : "Rejected");
    } catch {
      // no-op in fallback mode
    }
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    toast.success(status === "Removed" ? "Post removed" : status === "Rejected" ? "Post rejected" : "Post approved");
  };

  const highlightKeywords = (content: string, keywords: string[]) => {
    if (keywords.length === 0) {
      return content;
    }

    let highlighted = content;
    for (const keyword of keywords) {
      const regex = new RegExp(`(${keyword})`, "ig");
      highlighted = highlighted.replace(regex, "<mark>$1</mark>");
    }

    return highlighted;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Post moderation</h2>
          <p className="text-sm text-muted-foreground">Review reported posts and AI spam-detection results.</p>
        </div>
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          {posts.length} in moderation queue • total {total}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by author or content..."
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
        {!loading && posts.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-xs font-semibold">
                  {p.author_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{p.author_name}</p>
                    <Badge variant="outline" className={`${statusStyles[p.status]}`}>{p.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-foreground" dangerouslySetInnerHTML={{ __html: highlightKeywords(p.content, p.flagged_keywords) }} />
                  {p.flagged_keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.flagged_keywords.map((keyword) => (
                        <Badge key={keyword} variant="outline" className="text-amber-600 border-amber-300">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {p.spam_score > 70 && (
                <div className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" /> High risk
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Spam score (AI)</span>
                  <span className={p.spam_score > 70 ? "font-semibold text-destructive" : "text-foreground"}>{p.spam_score}/100</span>
                </div>
                <Progress value={p.spam_score} className="mt-1.5 h-1.5" />
              </div>
              <div className="flex gap-2">
                {p.status !== "Removed" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => update(p.id, "Approved")}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => update(p.id, "Rejected")}>
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </>
                )}
                {p.status !== "Removed" && (
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => update(p.id, "Removed")}>
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {!loading && posts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            <FileText className="mx-auto mb-2 h-6 w-6" /> No posts in this view.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={goPrev} disabled={page <= 1}>Previous</Button>
          <Button size="sm" variant="outline" onClick={goNext} disabled={page >= totalPages}>Next</Button>
        </div>
      </div>
    </div>
  );
}
