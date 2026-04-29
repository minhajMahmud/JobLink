import { useMemo, useState, useEffect } from "react";
import { initialApplications, Application, ApplicationStatus } from "@/data/mockData";
import { CheckCircle2, Clock, XCircle, CalendarDays, Award, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import * as candidateApi from "@/features/profile/api/candidateApi";
import { toast } from "sonner";

const statusConfig: Record<ApplicationStatus, { icon: React.ElementType; color: string; bg: string }> = {
  Applied: { icon: Clock, color: "text-muted-foreground", bg: "bg-secondary" },
  Shortlisted: { icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
  Interview: { icon: CalendarDays, color: "text-warning", bg: "bg-warning/10" },
  Rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  Hired: { icon: Award, color: "text-accent", bg: "bg-accent/10" },
};

const statusOrder: ApplicationStatus[] = ["Applied", "Shortlisted", "Interview", "Hired", "Rejected"];
const boardColumns: ApplicationStatus[] = ["Applied", "Shortlisted", "Interview", "Hired", "Rejected"];

const APPLICATIONS_STORAGE_KEY = "joblink.applications";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<ApplicationStatus | "All">("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch applications from backend
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await candidateApi.getApplications();
        const appsData = Array.isArray(response) ? response : response.data || [];
        setApplications(appsData);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
        setError("Failed to load applications. Using mock data.");
        // Fallback to mock data on error
        setApplications(initialApplications);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const filtered = useMemo(() => {
    return filter === "All" ? applications : applications.filter((a) => a.status === filter);
  }, [applications, filter]);

  const moveApplication = async (id: string, status: ApplicationStatus) => {
    const appToMove = applications.find(app => app.id === id);
    if (!appToMove || appToMove.status === status) return;

    try {
      // Call backend API to update status
      await candidateApi.updateApplicationStatus(id, status);
      
      // Update local state
      setApplications((current) =>
        current.map((app) =>
          app.id === id
            ? {
              ...app,
              status,
              statusHistory: [...app.statusHistory, { status, date: "Just now" }],
            }
            : app,
        ),
      );
      
      toast.success(`Application moved to ${status}`);
    } catch (err) {
      console.error("Failed to update application status:", err);
      toast.error("Failed to update application status.");
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("applicationId", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("applicationId");
    if (id) moveApplication(id, targetStatus);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {error && (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      
      <section className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-card p-6 md:p-8 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent to-violet-500/8" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800/50 dark:bg-blue-500/15 dark:text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Application pipeline
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">My Applications</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Track the status of your {loading ? "..." : applications.length} applications in a premium Kanban workflow with drag-and-drop updates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[520px]">
            {[
              { label: "Applied", value: applications.filter((a) => a.status === "Applied").length, tone: "bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-200" },
              { label: "Shortlisted", value: applications.filter((a) => a.status === "Shortlisted").length, tone: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
              { label: "Interview", value: applications.filter((a) => a.status === "Interview").length, tone: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
              { label: "Hired", value: applications.filter((a) => a.status === "Hired").length, tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border/50 bg-background/80 p-3 text-center shadow-sm backdrop-blur-sm">
                <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${item.tone}`}>
                  {item.value}
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {(Object.keys(statusConfig) as ApplicationStatus[]).map((status) => {
          const count = applications.filter((a) => a.status === status).length;
          const cfg = statusConfig[status];
          const Icon = cfg.icon;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(filter === status ? "All" : status)}
              className={`group rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${filter === status ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border/60 bg-card hover:border-primary/30"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${cfg.bg} ${cfg.color} transition-transform group-hover:scale-105`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{status}</span>
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">{count}</p>
              <p className="mt-1 text-[11px] font-medium text-muted-foreground">Applications</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {loading ? (
          <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">Loading your applications...</p>
          </div>
        ) : (
          boardColumns.map((columnStatus) => {
          const columnEntries = filtered.filter((app) => app.status === columnStatus);
          const cfg = statusConfig[columnStatus];
          const Icon = cfg.icon;

          return (
            <section
              key={columnStatus}
              className="flex h-[70vh] flex-col overflow-hidden rounded-[1.5rem] border border-border/60 bg-card shadow-sm"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, columnStatus)}
            >
              <div className="shrink-0 border-b border-border/50 bg-gradient-to-r from-background to-background/60 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${cfg.bg} ${cfg.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{columnStatus}</p>
                      <p className="text-[11px] text-muted-foreground">Pipeline stage</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">{columnEntries.length}</span>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3 no-scrollbar">
                {columnEntries.map((app) => {
                  const nextStatus = statusOrder[Math.min(statusOrder.indexOf(app.status) + 1, statusOrder.length - 1)];
                  const isFinalStage = nextStatus === app.status;

                  return (
                    <motion.article
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, app.id)}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group cursor-grab active:cursor-grabbing rounded-2xl border border-border/60 bg-background p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <img src={app.job.companyLogo} alt={app.job.company} className="h-11 w-11 rounded-xl object-cover ring-1 ring-border/60 transition-all group-hover:ring-primary/30" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">{app.job.title}</p>
                          <p className="truncate text-xs font-medium text-muted-foreground">{app.job.company}</p>
                        </div>
                      </div>

                      <div className="mt-3 inline-flex items-center rounded-full bg-secondary/60 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                        Applied: {app.appliedAt}
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-card/70 px-3 py-2">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Next step</p>
                          <p className="text-xs font-semibold text-foreground">{isFinalStage ? "Complete" : nextStatus}</p>
                        </div>
                        {!isFinalStage ? (
                          <button
                            type="button"
                            onClick={() => moveApplication(app.id, nextStatus)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-[10px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                          >
                            Advance
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        ) : (
                          <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">Done</span>
                        )}
                      </div>

                      <div className="mt-4 space-y-2 border-t border-border/50 pt-3 text-[10px] text-muted-foreground relative">
                        {app.statusHistory.slice(-2).map((history, index) => (
                          <div key={`${app.id}-${history.status}-${index}`} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                            <span className="font-medium">{history.status}</span>
                            <span className="opacity-70 ml-auto">{history.date}</span>
                          </div>
                        ))}
                      </div>
                    </motion.article>
                  );
                })}

                {columnEntries.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-border/50 rounded-xl h-24 mt-2">
                    <p className="text-xs text-muted-foreground font-medium">Drop applications here</p>
                  </div>
                )}
              </div>
            </section>
          );
        })
        )}
      </div>
    </div>
  );
}
