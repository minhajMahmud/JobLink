import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Users, Search, Star, Zap, MessageSquare, UserCheck, Clock, CalendarDays, X } from "lucide-react";
import {
  employerApplicants as initialApplicants,
  employerJobs as initialJobs,
  type ApplicantStatus,
  type EmployerApplicant,
} from "@/data/employerMockData";

const applicantStatusClasses: Record<ApplicantStatus, string> = {
  Applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Reviewed: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Interview: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Offer: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  Hired: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Rejected: "bg-destructive/10 text-destructive",
};

const boardColumns: { status: ApplicantStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: "Applied", label: "New Applications", icon: Clock, color: "text-blue-600" },
  { status: "Reviewed", label: "Reviewed", icon: UserCheck, color: "text-purple-600" },
  { status: "Interview", label: "Interview", icon: CalendarDays, color: "text-amber-600" },
  { status: "Offer", label: "Offer Stage", icon: Star, color: "text-indigo-600" },
  { status: "Hired", label: "Hired", icon: Briefcase, color: "text-emerald-600" },
  { status: "Rejected", label: "Rejected", icon: X, color: "text-destructive" },
];

export default function EmployerApplicationsPage() {
  const [applicants, setApplicants] = useState(initialApplicants);
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("All");

  const filteredApplicants = useMemo(() => {
    return applicants.filter((a) => {
      const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase());
      const matchesJob = jobFilter === "All" || a.appliedFor === jobFilter;
      return matchesSearch && matchesJob;
    });
  }, [applicants, search, jobFilter]);

  const updateStatus = (applicantId: string, status: ApplicantStatus) => {
    setApplicants((prev) => prev.map((a) => (a.id === applicantId ? { ...a, status } : a)));
  };

  const uniqueJobs = useMemo(() => [...new Set(applicants.map((a) => a.appliedFor))], [applicants]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("applicationId", id);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ApplicantStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("applicationId");
    if (id) updateStatus(id, targetStatus);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-card p-6 md:p-8 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 via-transparent to-orange-500/8" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/50 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-800/50 dark:bg-amber-500/15 dark:text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            Employer Applications
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">Received Applications</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review, filter, and manage all job applications received from candidates. Drag and drop between pipeline stages.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {boardColumns.map((col) => {
              const count = applicants.filter((a) => a.status === col.status).length;
              return (
                <div key={col.status} className="rounded-2xl border border-border/50 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <col.icon className={`h-4 w-4 ${col.color}`} />
                      <span className="text-sm font-semibold text-foreground">{col.label}</span>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${applicantStatusClasses[col.status]}`}>{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border/50 bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applicants..."
              className="h-10 w-full rounded-xl border border-border/50 bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            title="Filter by job"
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="h-10 rounded-xl border border-border/50 bg-background px-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Jobs</option>
            {uniqueJobs.map((job) => (
              <option key={job} value={job}>{job}</option>
            ))}
          </select>
        </div>
      </section>

      <div className="flex gap-6 overflow-x-auto pb-6 snap-x scrollbar-hide">
        {boardColumns.map((col) => {
          const Icon = col.icon;
          const columnApplicants = filteredApplicants.filter((a) => a.status === col.status);
          return (
            <div
              key={col.status}
              className="min-w-[320px] w-[320px] bg-secondary/30 rounded-3xl p-5 flex flex-col gap-4 snap-center shrink-0 border border-border/50"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.status)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${col.color}`} />
                  <h3 className="font-display font-bold text-foreground text-lg">{col.label}</h3>
                </div>
                <span className="bg-background text-muted-foreground font-semibold text-xs px-2.5 py-1 rounded-md border border-border/50">{columnApplicants.length}</span>
              </div>

              <div className="flex flex-col gap-4">
                {columnApplicants.map((applicant) => (
                  <motion.article
                    key={applicant.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, applicant.id)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[1.25rem] border border-border/50 bg-card p-5 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing flex flex-col group"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <img src={applicant.avatar} alt={applicant.name} className="h-12 w-12 rounded-xl object-cover ring-1 ring-border" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground tracking-tight leading-tight">{applicant.name}</h4>
                        <p className="text-[11px] font-medium text-muted-foreground mt-1">{applicant.appliedFor}</p>
                      </div>
                      <div className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Zap className="w-3 h-3" /> {applicant.match}%
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {applicant.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="bg-secondary text-foreground px-2 py-0.5 rounded text-[10px] font-medium">{skill}</span>
                      ))}
                    </div>

                    <div className="mb-3 bg-secondary/30 rounded-xl p-3 border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-semibold text-muted-foreground">Notes</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                        {applicant.notes ? `"${applicant.notes}"` : "No notes added yet."}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <select
                        title="Update status"
                        value={applicant.status}
                        onChange={(e) => updateStatus(applicant.id, e.target.value as ApplicantStatus)}
                        className="text-xs font-semibold bg-secondary/50 border border-border/50 rounded-lg px-2 py-1.5 outline-none flex-1"
                      >
                        {boardColumns.map((c) => (
                          <option key={c.status} value={c.status}>Move to {c.label}</option>
                        ))}
                      </select>
                      <button className="p-1.5 rounded-lg border border-border/50 bg-background text-muted-foreground hover:text-primary transition-colors" title="Send message">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.article>
                ))}
                {columnApplicants.length === 0 && (
                  <div className="p-6 border-2 border-dashed border-border/50 rounded-[1.25rem] text-center">
                    <p className="text-xs font-medium text-muted-foreground">Drop candidates here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}