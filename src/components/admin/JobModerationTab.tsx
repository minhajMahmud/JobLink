import { useState } from "react";
import { AlertTriangle, Briefcase, MapPin, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminJobs, type AdminJob } from "@/data/adminMockData";
import { toast } from "sonner";

const statusStyles: Record<AdminJob["status"], string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  flagged: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  removed: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function JobModerationTab() {
  const [jobs, setJobs] = useState<AdminJob[]>(adminJobs);

  const update = (id: string, status: AdminJob["status"]) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
    toast.success(status === "removed" ? "Job removed" : "Job approved");
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">Job moderation</h2>
        <p className="text-sm text-muted-foreground">Review flagged job listings before they reach candidates.</p>
      </div>

      <div className="grid gap-4">
        {jobs.map((j) => (
          <div key={j.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-semibold text-foreground">{j.title}</h3>
                  <Badge variant="outline" className={`capitalize ${statusStyles[j.status]}`}>{j.status}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {j.company}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {j.location}</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {j.applicants} applicants</span>
                  <span>· {j.postedAt}</span>
                </div>
                {j.reports > 0 && (
                  <div className="mt-3 inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" /> {j.reports} user reports
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {j.status !== "removed" && (
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => update(j.id, "removed")}>
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </Button>
                )}
                {j.status === "flagged" && (
                  <Button size="sm" onClick={() => update(j.id, "active")}>Approve</Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
