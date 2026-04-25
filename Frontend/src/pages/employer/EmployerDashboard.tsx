import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  Crown,
  LogOut,
  MessageSquare,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import NotificationsBell from "@/components/notifications/NotificationsBell";
import {
  companyPosts,
  companyProfile as initialCompanyProfile,
  employerApplicants as initialApplicants,
  employerInterviews as initialInterviews,
  employerJobs as initialJobs,
  type ApplicantStatus,
  type CompanyPost,
  type EmployerApplicant,
  type EmployerInterview,
  type EmployerJob,
  type InterviewMode,
} from "@/data/employerMockData";

const applicantStatusClasses: Record<ApplicantStatus, string> = {
  New: "bg-primary/10 text-primary",
  Reviewing: "bg-secondary text-secondary-foreground",
  Accepted: "bg-accent/10 text-accent",
  Rejected: "bg-destructive/10 text-destructive",
};

const panelStats = [
  {
    label: "Open jobs",
    icon: Briefcase,
    getValue: (jobs: EmployerJob[]) => jobs.length,
  },
  {
    label: "Applicants",
    icon: Users,
    getValue: (_jobs: EmployerJob[], applicants: EmployerApplicant[]) => applicants.length,
  },
  {
    label: "Scheduled interviews",
    icon: CalendarDays,
    getValue: (_jobs: EmployerJob[], _applicants: EmployerApplicant[], interviews: EmployerInterview[]) => interviews.length,
  },
  {
    label: "Featured jobs",
    icon: Sparkles,
    getValue: (jobs: EmployerJob[]) => jobs.filter((job) => job.featured).length,
  },
] as const;

const employerBadges = [
  { icon: BadgeCheck, label: "Verified Employer", color: "text-blue-600" },
  { icon: Crown, label: "Premium Recruiter", color: "text-amber-500" },
  { icon: Shield, label: "Trusted Hiring", color: "text-emerald-600" },
] as const;

function barValue(value: number) {
  return Math.max(12, Math.min(100, value));
}

export default function EmployerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [companyProfile, setCompanyProfile] = useState(initialCompanyProfile);
  const [jobs, setJobs] = useState(initialJobs);
  const [applicants, setApplicants] = useState(initialApplicants);
  const [interviews, setInterviews] = useState(initialInterviews);
  const [posts, setPosts] = useState(companyPosts);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateStatus, setCandidateStatus] = useState<ApplicantStatus | "All">("All");
  const [candidateSkill, setCandidateSkill] = useState("");
  const [newJob, setNewJob] = useState({ title: "", location: "", salary: "", type: "Full-time" });
  const [newInterview, setNewInterview] = useState({ candidate: "", role: "", date: "", time: "", mode: "Video" as InterviewMode });
  const [newPost, setNewPost] = useState({ title: "", body: "" });

  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const matchesSearch = applicant.name.toLowerCase().includes(candidateSearch.toLowerCase());
      const matchesStatus = candidateStatus === "All" || applicant.status === candidateStatus;
      const matchesSkill = !candidateSkill || applicant.skills.some((skill) => skill.toLowerCase().includes(candidateSkill.toLowerCase()));
      return matchesSearch && matchesStatus && matchesSkill;
    });
  }, [applicants, candidateSearch, candidateSkill, candidateStatus]);

  const acceptedApplicants = applicants.filter((applicant) => applicant.status === "Accepted").length;
  const conversionRate = applicants.length ? Math.round((acceptedApplicants / applicants.length) * 100) : 0;

  const createJob = () => {
    if (!newJob.title.trim() || !newJob.location.trim()) return;

    setJobs((current) => [
      {
        id: `job-${Date.now()}`,
        title: newJob.title,
        location: newJob.location,
        salary: newJob.salary || "Negotiable",
        type: newJob.type,
        postedAt: "Just now",
        applicants: 0,
        featured: false,
      },
      ...current,
    ]);

    setNewJob({ title: "", location: "", salary: "", type: "Full-time" });
  };

  const toggleFeatured = (jobId: string) => {
    setJobs((current) => current.map((job) => (job.id === jobId ? { ...job, featured: !job.featured } : job)));
  };

  const removeJob = (jobId: string) => {
    setJobs((current) => current.filter((job) => job.id !== jobId));
  };

  const updateApplicantStatus = (applicantId: string, status: ApplicantStatus) => {
    setApplicants((current) => current.map((applicant) => (applicant.id === applicantId ? { ...applicant, status } : applicant)));
  };

  const scheduleInterview = () => {
    if (!newInterview.candidate.trim() || !newInterview.role.trim() || !newInterview.date || !newInterview.time) return;

    setInterviews((current) => [
      {
        id: `interview-${Date.now()}`,
        candidate: newInterview.candidate,
        role: newInterview.role,
        date: newInterview.date,
        time: newInterview.time,
        mode: newInterview.mode,
      },
      ...current,
    ]);

    setNewInterview({ candidate: "", role: "", date: "", time: "", mode: "Video" });
  };

  const publishPost = () => {
    if (!newPost.title.trim() || !newPost.body.trim()) return;

    const entry: CompanyPost = {
      id: `post-${Date.now()}`,
      title: newPost.title,
      body: newPost.body,
      createdAt: "Just now",
    };

    setPosts((current) => [entry, ...current]);
    setNewPost({ title: "", body: "" });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-card">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-emerald-500/10" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Employer Panel</p>
                <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground">Manage hiring from one control room.</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Review applicants, publish company updates, promote featured roles, and track hiring momentum in one place.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {employerBadges.map((badge) => (
                    <span key={badge.label} className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm">
                      <badge.icon className={`h-3.5 w-3.5 ${badge.color}`} />
                      {badge.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="self-start rounded-2xl border border-border bg-background/95 p-3 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <img src={user?.avatar} alt={user?.name} className="h-12 w-12 rounded-2xl object-cover ring-2 ring-primary/20" />
                  <div>
                    <p className="font-medium text-foreground">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.company ?? companyProfile.name}</p>
                  </div>
                  <NotificationsBell variant="panel" />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-secondary/60 px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Hiring health</span>
                  <span className="font-semibold text-foreground">94% strong</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/messages")}
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {panelStats.map((item) => {
            const Icon = item.icon;
            const value = item.getValue(jobs, applicants, interviews);
            return (
              <div key={item.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-5 font-display text-3xl font-bold text-foreground">{value}</p>
              </div>
            );
          })}
        </section>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 rounded-2xl border border-border bg-card p-2">
            <TabsTrigger value="company">Company profile</TabsTrigger>
            <TabsTrigger value="jobs">Job posts</TabsTrigger>
            <TabsTrigger value="applicants">Applicants</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="analytics">Hiring analytics</TabsTrigger>
            <TabsTrigger value="posts">Company posts</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="mt-0">
            <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <img src={companyProfile.logo} alt={companyProfile.name} className="h-20 w-20 rounded-3xl object-cover" />
                <h2 className="mt-5 font-display text-2xl font-bold text-foreground">{companyProfile.name}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{companyProfile.description}</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h3 className="font-display text-xl font-semibold text-foreground">Company profile management</h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm text-foreground">
                    <span className="mb-2 block font-medium">Company name</span>
                    <input value={companyProfile.name} onChange={(event) => setCompanyProfile((current) => ({ ...current, name: event.target.value }))} className="h-11 w-full rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
                  </label>
                  <label className="text-sm text-foreground">
                    <span className="mb-2 block font-medium">Industry</span>
                    <input value={companyProfile.industry} onChange={(event) => setCompanyProfile((current) => ({ ...current, industry: event.target.value }))} className="h-11 w-full rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
                  </label>
                  <label className="text-sm text-foreground">
                    <span className="mb-2 block font-medium">Company size</span>
                    <input value={companyProfile.size} onChange={(event) => setCompanyProfile((current) => ({ ...current, size: event.target.value }))} className="h-11 w-full rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
                  </label>
                  <label className="text-sm text-foreground">
                    <span className="mb-2 block font-medium">Website</span>
                    <input value={companyProfile.website} onChange={(event) => setCompanyProfile((current) => ({ ...current, website: event.target.value }))} className="h-11 w-full rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
                  </label>
                  <label className="text-sm text-foreground sm:col-span-2">
                    <span className="mb-2 block font-medium">Headquarters</span>
                    <input value={companyProfile.headquarters} onChange={(event) => setCompanyProfile((current) => ({ ...current, headquarters: event.target.value }))} className="h-11 w-full rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
                  </label>
                  <label className="text-sm text-foreground sm:col-span-2">
                    <span className="mb-2 block font-medium">Description</span>
                    <textarea value={companyProfile.description} onChange={(event) => setCompanyProfile((current) => ({ ...current, description: event.target.value }))} className="min-h-32 w-full rounded-2xl border border-input bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="mt-0 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-display text-xl font-semibold text-foreground">Create and manage job posts</h3>
              <div className="mt-5 grid gap-4 lg:grid-cols-4">
                <input value={newJob.title} onChange={(event) => setNewJob((current) => ({ ...current, title: event.target.value }))} placeholder="Job title" className="h-11 rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
                <input value={newJob.location} onChange={(event) => setNewJob((current) => ({ ...current, location: event.target.value }))} placeholder="Location" className="h-11 rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
                <input value={newJob.salary} onChange={(event) => setNewJob((current) => ({ ...current, salary: event.target.value }))} placeholder="Salary range" className="h-11 rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
                <div className="flex gap-3">
                  <select
                    value={newJob.type}
                    onChange={(event) => setNewJob((current) => ({ ...current, type: event.target.value }))}
                    title="Job type"
                    aria-label="Job type"
                    className="h-11 flex-1 rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Hybrid</option>
                    <option>Remote</option>
                  </select>
                  <button type="button" onClick={createJob} className="rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {jobs.map((job) => (
                <article key={job.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-display text-xl font-semibold text-foreground">{job.title}</h4>
                        {job.featured && <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">Featured</span>}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {job.location} • {job.type} • {job.salary}
                      </p>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Posted {job.postedAt} • {job.applicants} applicants
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => toggleFeatured(job.id)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                        <Star className="h-4 w-4" />
                        {job.featured ? "Unfeature" : "Feature job"}
                      </button>
                      <button type="button" onClick={() => removeJob(job.id)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                        <X className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applicants" className="mt-0 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center gap-2 text-foreground">
                <Search className="h-4 w-4" />
                <h3 className="font-display text-xl font-semibold">Candidate filtering system</h3>
              </div>

              <div className="grid gap-4 lg:grid-cols-4">
                <input value={candidateSearch} onChange={(event) => setCandidateSearch(event.target.value)} placeholder="Search candidate" className="h-11 rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
                <select
                  value={candidateStatus}
                  onChange={(event) => setCandidateStatus(event.target.value as ApplicantStatus | "All")}
                  title="Applicant status filter"
                  aria-label="Applicant status filter"
                  className="h-11 rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                >
                  <option value="All">All statuses</option>
                  <option value="New">New</option>
                  <option value="Reviewing">Reviewing</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <input value={candidateSkill} onChange={(event) => setCandidateSkill(event.target.value)} placeholder="Filter by skill" className="h-11 rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
                <div className="flex items-center rounded-xl bg-secondary px-4 text-sm text-secondary-foreground">
                  {filteredApplicants.length} candidates shown
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredApplicants.map((applicant) => (
                <article key={applicant.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <img src={applicant.avatar} alt={applicant.name} className="h-14 w-14 rounded-2xl object-cover" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display text-lg font-semibold text-foreground">{applicant.name}</h4>
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${applicantStatusClasses[applicant.status]}`}>
                            {applicant.status}
                          </span>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{applicant.match}% match</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {applicant.role} • Applied for {applicant.appliedFor}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {applicant.skills.map((skill) => (
                            <span key={skill} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => updateApplicantStatus(applicant.id, "Accepted")} className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90">
                        <UserCheck className="h-4 w-4" />
                        Accept
                      </button>
                      <button type="button" onClick={() => updateApplicantStatus(applicant.id, "Rejected")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                        Reject
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="interviews" className="mt-0 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-display text-xl font-semibold text-foreground">Interview scheduling</h3>
              <div className="mt-5 grid gap-4 lg:grid-cols-5">
                <input value={newInterview.candidate} onChange={(event) => setNewInterview((current) => ({ ...current, candidate: event.target.value }))} placeholder="Candidate name" title="Candidate name" className="h-11 rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
                <input value={newInterview.role} onChange={(event) => setNewInterview((current) => ({ ...current, role: event.target.value }))} placeholder="Role" title="Role" className="h-11 rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
                <input type="date" value={newInterview.date} onChange={(event) => setNewInterview((current) => ({ ...current, date: event.target.value }))} title="Interview date" aria-label="Interview date" className="h-11 rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
                <input type="time" value={newInterview.time} onChange={(event) => setNewInterview((current) => ({ ...current, time: event.target.value }))} title="Interview time" aria-label="Interview time" className="h-11 rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
                <div className="flex gap-3">
                  <select
                    value={newInterview.mode}
                    onChange={(event) => setNewInterview((current) => ({ ...current, mode: event.target.value as InterviewMode }))}
                    title="Interview mode"
                    aria-label="Interview mode"
                    className="h-11 flex-1 rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                  >
                    <option value="Video">Video</option>
                    <option value="Phone">Phone</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                  <button type="button" onClick={scheduleInterview} className="rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {interviews.map((interview) => (
                <article key={interview.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-display text-lg font-semibold text-foreground">{interview.candidate}</h4>
                      <p className="mt-2 text-sm text-muted-foreground">{interview.role}</p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">{interview.mode}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>{interview.date}</span>
                    <span>•</span>
                    <span>{interview.time}</span>
                  </div>
                </article>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <p className="text-sm text-muted-foreground">Total applicants</p>
                <p className="mt-4 font-display text-3xl font-bold text-foreground">{applicants.length}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <p className="text-sm text-muted-foreground">Accepted candidates</p>
                <p className="mt-4 font-display text-3xl font-bold text-foreground">{acceptedApplicants}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <p className="text-sm text-muted-foreground">Hiring conversion</p>
                <p className="mt-4 font-display text-3xl font-bold text-foreground">{conversionRate}%</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <p className="text-sm text-muted-foreground">Average job demand</p>
                <p className="mt-4 font-display text-3xl font-bold text-foreground">
                  {jobs.length ? Math.round(jobs.reduce((sum, job) => sum + job.applicants, 0) / jobs.length) : 0}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <h3 className="font-display text-xl font-semibold">Job demand overview</h3>
                </div>
                <div className="mt-6 space-y-4">
                  {jobs.map((job) => {
                    const width = Math.max(12, Math.min(100, job.applicants * 3));
                    return (
                      <div key={job.id}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{job.title}</span>
                          <span className="text-muted-foreground">{job.applicants} applicants</span>
                        </div>
                        <Progress value={barValue(width)} className="h-3" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-2 text-foreground">
                  <Building2 className="h-4 w-4" />
                  <h3 className="font-display text-xl font-semibold">Hiring health</h3>
                </div>
                <div className="mt-6 space-y-4">
                  {[
                    { label: "Profile completeness", value: 94 },
                    { label: "Interview pipeline", value: 68 },
                    { label: "Featured job reach", value: 81 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{item.label}</span>
                        <span className="text-muted-foreground">{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-3" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="posts" className="mt-0 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center gap-2 text-foreground">
                <MessageSquare className="h-4 w-4" />
                <h3 className="font-display text-xl font-semibold">Company posts</h3>
              </div>
              <div className="grid gap-4">
                <input value={newPost.title} onChange={(event) => setNewPost((current) => ({ ...current, title: event.target.value }))} placeholder="Post title" className="h-11 rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
                <textarea value={newPost.body} onChange={(event) => setNewPost((current) => ({ ...current, body: event.target.value }))} placeholder="Share a company update" className="min-h-32 rounded-2xl border border-input bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
                <div className="flex justify-end">
                  <button type="button" onClick={publishPost} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                    Publish post
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {posts.map((post) => (
                <article key={post.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="font-display text-xl font-semibold text-foreground">{post.title}</h4>
                    <span className="text-sm text-muted-foreground">{post.createdAt}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{post.body}</p>
                </article>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
