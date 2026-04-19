import { useState } from "react";
import { AlertTriangle, Eye, FileText, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { adminPosts, type AdminPost } from "@/data/adminMockData";
import { toast } from "sonner";

const statusStyles: Record<AdminPost["status"], string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  flagged: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  removed: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function PostModerationTab() {
  const [posts, setPosts] = useState<AdminPost[]>(adminPosts);
  const [filter, setFilter] = useState<"all" | "flagged" | "active" | "removed">("all");

  const visible = posts.filter((p) => filter === "all" || p.status === filter);

  const update = (id: string, status: AdminPost["status"]) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    toast.success(status === "removed" ? "Post removed" : "Post approved");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Post moderation</h2>
          <p className="text-sm text-muted-foreground">Review reported posts and AI spam-detection results.</p>
        </div>
        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          {(["all", "flagged", "active", "removed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {visible.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <img src={p.authorAvatar} alt={p.author} className="h-10 w-10 rounded-xl object-cover" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{p.author}</p>
                    <span className="text-xs text-muted-foreground">· {p.postedAt}</span>
                    <Badge variant="outline" className={`capitalize ${statusStyles[p.status]}`}>{p.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-foreground">{p.content}</p>
                </div>
              </div>
              {p.reports > 0 && (
                <div className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" /> {p.reports} reports
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Spam score (AI)</span>
                  <span className={p.spamScore > 70 ? "font-semibold text-destructive" : "text-foreground"}>{p.spamScore}/100</span>
                </div>
                <Progress value={p.spamScore} className="mt-1.5 h-1.5" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline"><Eye className="h-3.5 w-3.5" /> View</Button>
                {p.status !== "removed" && (
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => update(p.id, "removed")}>
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </Button>
                )}
                {p.status === "flagged" && (
                  <Button size="sm" onClick={() => update(p.id, "active")}>Approve</Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            <FileText className="mx-auto mb-2 h-6 w-6" /> No posts in this view.
          </div>
        )}
      </div>
    </div>
  );
}
