import { useState } from "react";
import { initialApplications, Application, ApplicationStatus } from "@/data/mockData";
import { CheckCircle2, Clock, XCircle, CalendarDays, Award, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig: Record<ApplicationStatus, { icon: React.ElementType; color: string; bg: string }> = {
  Applied: { icon: Clock, color: "text-muted-foreground", bg: "bg-secondary" },
  Shortlisted: { icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
  Interview: { icon: CalendarDays, color: "text-warning", bg: "bg-warning/10" },
  Rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  Hired: { icon: Award, color: "text-accent", bg: "bg-accent/10" },
};

const statusOrder: ApplicationStatus[] = ["Applied", "Shortlisted", "Interview", "Hired"];

const filterOptions: (ApplicationStatus | "All")[] = ["All", "Applied", "Shortlisted", "Interview", "Rejected", "Hired"];

export default function ApplicationsPage() {
  const [applications] = useState<Application[]>(initialApplications);
  const [filter, setFilter] = useState<ApplicationStatus | "All">("All");

  const filtered = filter === "All" ? applications : applications.filter((a) => a.status === filter);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">My Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track the status of your {applications.length} job applications
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
              className={`rounded-2xl border p-3 text-center transition-all ${
                filter === status ? "border-primary shadow-card" : "border-border hover:border-primary/30"
              } bg-card`}
            >
              <Icon className={`mx-auto h-5 w-5 ${cfg.color}`} />
              <p className="mt-1 text-lg font-bold text-foreground">{count}</p>
              <p className="text-[10px] font-medium text-muted-foreground">{status}</p>
            </button>
          );
        })}
      </div>

      {/* Application list */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((app) => {
            const cfg = statusConfig[app.status];
            const Icon = cfg.icon;
            const currentIdx = statusOrder.indexOf(app.status);
            const isRejected = app.status === "Rejected";

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={app.job.companyLogo}
                    alt={app.job.company}
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-semibold font-display text-foreground">{app.job.title}</h3>
                        <p className="text-sm text-muted-foreground">{app.job.company} · {app.job.location}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {app.status}
                      </div>
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">Applied {app.appliedAt}</p>

                    {/* Progress pipeline */}
                    <div className="mt-4 flex items-center gap-1">
                      {statusOrder.map((step, i) => {
                        const reached = !isRejected && i <= currentIdx;
                        return (
                          <div key={step} className="flex items-center gap-1 flex-1">
                            <div
                              className={`h-2 flex-1 rounded-full transition-colors ${
                                reached ? "bg-primary" : isRejected && i === 0 ? "bg-destructive" : "bg-secondary"
                              }`}
                            />
                            {i < statusOrder.length - 1 && (
                              <ChevronRight className={`h-3 w-3 shrink-0 ${reached ? "text-primary" : "text-muted-foreground/30"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                      {statusOrder.map((step) => (
                        <span key={step}>{step}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-card">
            <p className="text-sm text-muted-foreground">No applications with this status.</p>
          </div>
        )}
      </div>
    </div>
  );
}
