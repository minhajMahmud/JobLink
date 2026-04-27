import { useMemo, useState } from "react";
import { initialApplications, Application, ApplicationStatus } from "@/data/mockData";
import { CheckCircle2, Clock, XCircle, CalendarDays, Award, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig: Record<ApplicationStatus, { icon: React.ElementType; color: string; bg: string }> = {
  Applied: { icon: Clock, color: "text-muted-foreground", bg: "bg-secondary" },
  Shortlisted: { icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
  Interview: { icon: CalendarDays, color: "text-warning", bg: "bg-warning/10" },
  Rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  Hired: { icon: Award, color: "text-accent", bg: "bg-accent/10" },
};

const statusOrder: ApplicationStatus[] = ["Applied", "Shortlisted", "Interview", "Hired", "Rejected"];
const boardColumns: ApplicationStatus[] = ["Applied", "Shortlisted", "Interview", "Hired", "Rejected"];

const filterOptions: (ApplicationStatus | "All")[] = ["All", "Applied", "Shortlisted", "Interview", "Rejected", "Hired"];
const APPLICATIONS_STORAGE_KEY = "joblink.applications";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>(() => {
    const raw = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
    const persisted = raw ? (JSON.parse(raw) as Application[]) : [];

    const merged = [...persisted, ...initialApplications].reduce<Application[]>((acc, current) => {
      if (acc.some((entry) => entry.jobId === current.jobId)) {
        return acc;
      }

      acc.push(current);
      return acc;
    }, []);

    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(merged));
    return merged;
  });
  const [filter, setFilter] = useState<ApplicationStatus | "All">("All");

  const filtered = useMemo(() => {
    return filter === "All" ? applications : applications.filter((a) => a.status === filter);
  }, [applications, filter]);

  const moveApplication = (id: string, status: ApplicationStatus) => {
    setApplications((current) => {
      const appToMove = current.find(app => app.id === id);
      if (!appToMove || appToMove.status === status) return current;

      const next = current.map((app) =>
        app.id === id
          ? {
            ...app,
            status,
            statusHistory: [...app.statusHistory, { status, date: "Just now" }],
          }
          : app,
      );

      localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
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
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">My Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track the status of your {applications.length} job applications on a Kanban board.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {(Object.keys(statusConfig) as ApplicationStatus[]).map((status) => {
          const count = applications.filter((a) => a.status === status).length;
          const cfg = statusConfig[status];
          const Icon = cfg.icon;
          return (
            <button
              key={status}
              onClick={() => setFilter(filter === status ? "All" : status)}
              className={`rounded-2xl border p-3 text-center transition-all ${filter === status ? "border-primary shadow-card" : "border-border hover:border-primary/30"
                } bg-card`}
            >
              <Icon className={`mx-auto h-5 w-5 ${cfg.color}`} />
              <p className="mt-1 text-lg font-bold text-foreground">{count}</p>
              <p className="text-[10px] font-medium text-muted-foreground">{status}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {boardColumns.map((columnStatus) => {
          const columnEntries = filtered.filter((app) => app.status === columnStatus);
          const cfg = statusConfig[columnStatus];
          const Icon = cfg.icon;

          return (
            <section
              key={columnStatus}
              className="rounded-2xl border border-border bg-card p-3 shadow-card flex flex-col h-[70vh]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, columnStatus)}
            >
              <div className="mb-3 flex items-center justify-between shrink-0 border-b border-border/50 pb-2">
                <div className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {columnStatus}
                </div>
                <span className="text-xs font-bold text-muted-foreground bg-secondary px-2 rounded-full">{columnEntries.length}</span>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 no-scrollbar pb-6 pr-1">
                {columnEntries.map((app) => {
                  const nextStatus = statusOrder[Math.min(statusOrder.indexOf(app.status) + 1, statusOrder.length - 1)];

                  return (
                    <motion.article
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, app.id)}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="cursor-grab active:cursor-grabbing rounded-xl border border-border bg-background p-4 shadow-sm hover:shadow-md transition-all hover:border-primary/40 group"
                    >
                      <div className="flex items-start gap-3">
                        <img src={app.job.companyLogo} alt={app.job.company} className="h-10 w-10 rounded-lg object-cover ring-1 ring-border group-hover:ring-primary/30 transition-all" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors">{app.job.title}</p>
                          <p className="truncate text-xs font-medium text-muted-foreground">{app.job.company}</p>
                        </div>
                      </div>

                      <div className="mt-3 block text-[10px] font-semibold text-muted-foreground bg-secondary/50 px-2 py-1 rounded inline-block">
                        Applied: {app.appliedAt}
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50 space-y-2 text-[10px] text-muted-foreground relative">
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
        })}
      </div>
    </div>
  );
}
