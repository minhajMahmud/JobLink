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
  Zap,
  BarChart3,
  CheckCircle2,
  Clock,
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
  const [candidateMinMatch, setCandidateMinMatch] = useState(0);
  const [newJob, setNewJob] = useState({
    title: "",
    location: "",
    remotePolicy: "Hybrid" as "Onsite" | "Hybrid" | "Remote",
    salaryMin: "",
    salaryMax: "",
    type: "Full-time",
    level: "Mid" as "Entry" | "Mid" | "Senior" | "Lead",
    requiredSkills: "",
    description: "",
  });
  const [newInterview, setNewInterview] = useState({ candidate: "", role: "", date: "", time: "", mode: "Video" as InterviewMode });
  const [newPost, setNewPost] = useState({ title: "", body: "" });

  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const matchesSearch = applicant.name.toLowerCase().includes(candidateSearch.toLowerCase());
      const matchesStatus = candidateStatus === "All" || applicant.status === candidateStatus;
      const matchesSkill = !candidateSkill || applicant.skills.some((skill) => skill.toLowerCase().includes(candidateSkill.toLowerCase()));
      const matchesScore = applicant.match >= candidateMinMatch;
      return matchesSearch && matchesStatus && matchesSkill && matchesScore;
    });
  }, [applicants, candidateMinMatch, candidateSearch, candidateSkill, candidateStatus]);

  const acceptedApplicants = applicants.filter((applicant) => applicant.status === "Accepted").length;
  const conversionRate = applicants.length ? Math.round((acceptedApplicants / applicants.length) * 100) : 0;

  const createJob = () => {
    if (!newJob.title.trim() || !newJob.location.trim()) return;

    const salaryMin = Number(newJob.salaryMin || 0);
    const salaryMax = Number(newJob.salaryMax || 0);

    setJobs((current) => [
      {
        id: `job-${Date.now()}`,
        title: newJob.title,
        location: newJob.location,
        remotePolicy: newJob.remotePolicy,
        salary: salaryMin && salaryMax ? `$${salaryMin}k - $${salaryMax}k` : "Negotiable",
        salaryMin,
        salaryMax,
        type: newJob.type,
        level: newJob.level,
        requiredSkills: newJob.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        description: newJob.description,
        postedAt: "Just now",
        applicants: 0,
        featured: false,
      },
      ...current,
    ]);

    setNewJob({
      title: "",
      location: "",
      remotePolicy: "Hybrid",
      salaryMin: "",
      salaryMax: "",
      type: "Full-time",
      level: "Mid",
      requiredSkills: "",
      description: "",
    });
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

  const updateApplicantNotes = (applicantId: string, notes: string) => {
    setApplicants((current) => current.map((applicant) => (applicant.id === applicantId ? { ...applicant, notes } : applicant)));
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
        <section className="overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 shadow-xl dark:from-slate-900/50 dark:via-blue-900/20 dark:to-violet-900/10">
          <div className="relative p-8 sm:p-10">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/15 via-violet-600/15 to-emerald-500/15 opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-background/80 dark:from-slate-900/40" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 px-4 py-1.5 border border-blue-200/30 dark:border-blue-800/30">
                  <Zap className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-300">Recruiter Hub</p>
                </div>
                <h1 className="mt-4 font-display text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-200 bg-clip-text text-transparent">
                  Hiring Control Center
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground font-medium">
                  Manage your entire recruitment pipeline with advanced analytics, applicant tracking, and hiring intelligence all in one powerful dashboard.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {employerBadges.map((badge) => (
                    <span key={badge.label} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-white/80 to-white/60 dark:from-slate-800/80 dark:to-slate-800/60 border border-border/40 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                      <badge.icon className={`h-4 w-4 ${badge.color}`} />
                      <span>{badge.label}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="self-start rounded-2xl border border-border/40 bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-800/80 dark:to-slate-800/60 p-5 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={user?.avatar} alt={user?.name} className="h-14 w-14 rounded-xl object-cover ring-3 ring-blue-500/30" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-transparent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{user?.name}</p>
                    <p className="text-xs text-muted-foreground font-medium">{user?.company ?? companyProfile.name}</p>
                  </div>
                  <NotificationsBell variant="panel" />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 px-3 py-2.5 border border-emerald-200/30 dark:border-emerald-800/30">
                  <span className="text-xs font-semibold text-muted-foreground">Hiring Health</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">94% Excellent</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/messages")}
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-xs font-semibold text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
                >
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border/40 px-4 text-xs font-medium text-foreground transition-all hover:bg-secondary/60"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {panelStats.map((item) => {
            const Icon = item.icon;
            const value = item.getValue(jobs, applicants, interviews);
            return (
              <div key={item.label} className="group relative rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/60 dark:to-slate-800/40 p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{item.label}</p>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 text-blue-600 dark:text-blue-400 group-hover:shadow-lg transition-all">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-6 font-display text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">{value}</p>
              </div>
            );
          })}
        </section>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 rounded-2xl border border-border/40 bg-gradient-to-r from-slate-50/80 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-800/20 p-3 shadow-sm">
            <TabsTrigger value="company" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg">Company profile</TabsTrigger>
            <TabsTrigger value="jobs" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg">Job posts</TabsTrigger>
            <TabsTrigger value="applicants" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg">Applicants</TabsTrigger>
            <TabsTrigger value="interviews" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg">Interviews</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg">Hiring analytics</TabsTrigger>
            <TabsTrigger value="posts" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg">Company posts</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="mt-0">
            <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
              <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-800/20 p-6 shadow-lg">
                <div className="relative inline-block">
                  <img src={companyProfile.logo} alt={companyProfile.name} className="h-24 w-24 rounded-2xl object-cover ring-4 ring-blue-500/20" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-transparent" />
                </div>
                <h2 className="mt-5 font-display text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">{companyProfile.name}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground font-medium">{companyProfile.description}</p>
              </div>

              <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-800/20 p-6 shadow-lg">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h3 className="font-display text-xl font-semibold">Company profile management</h3>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm text-foreground">
                    <span className="mb-2 block font-semibold">Company name</span>
                    <input value={companyProfile.name} onChange={(event) => setCompanyProfile((current) => ({ ...current, name: event.target.value }))} className="h-11 w-full rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60" />
                  </label>
                  <label className="text-sm text-foreground">
                    <span className="mb-2 block font-semibold">Industry</span>
                    <input value={companyProfile.industry} onChange={(event) => setCompanyProfile((current) => ({ ...current, industry: event.target.value }))} className="h-11 w-full rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60" />
                  </label>
                  <label className="text-sm text-foreground">
                    <span className="mb-2 block font-semibold">Company size</span>
                    <input value={companyProfile.size} onChange={(event) => setCompanyProfile((current) => ({ ...current, size: event.target.value }))} className="h-11 w-full rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60" />
                  </label>
                  <label className="text-sm text-foreground">
                    <span className="mb-2 block font-semibold">Website</span>
                    <input value={companyProfile.website} onChange={(event) => setCompanyProfile((current) => ({ ...current, website: event.target.value }))} className="h-11 w-full rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60" />
                  </label>
                  <label className="text-sm text-foreground sm:col-span-2">
                    <span className="mb-2 block font-semibold">Headquarters</span>
                    <input value={companyProfile.headquarters} onChange={(event) => setCompanyProfile((current) => ({ ...current, headquarters: event.target.value }))} className="h-11 w-full rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60" />
                  </label>
                  <label className="text-sm text-foreground sm:col-span-2">
                    <span className="mb-2 block font-semibold">Description</span>
                    <textarea value={companyProfile.description} onChange={(event) => setCompanyProfile((current) => ({ ...current, description: event.target.value }))} className="min-h-32 w-full rounded-2xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60" />
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="mt-0 space-y-6">
            <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-800/20 p-6 shadow-lg">
              <div className="flex items-center gap-2 text-foreground mb-5">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <h3 className="font-display text-xl font-semibold">Create and manage job posts</h3>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-4">
                <input value={newJob.title} onChange={(event) => setNewJob((current) => ({ ...current, title: event.target.value }))} placeholder="Job title" className="h-11 rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60" />
                <input value={newJob.location} onChange={(event) => setNewJob((current) => ({ ...current, location: event.target.value }))} placeholder="Location" className="h-11 rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60" />
                <select
                  value={newJob.remotePolicy}
                  onChange={(event) => setNewJob((current) => ({ ...current, remotePolicy: event.target.value as "Onsite" | "Hybrid" | "Remote" }))}
                  title="Remote policy"
                  aria-label="Remote policy"
                  className="h-11 rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60"
                >
                  <option value="Onsite">Onsite</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
                <div className="flex gap-3 lg:col-span-2">
                  <input value={newJob.salaryMin} onChange={(event) => setNewJob((current) => ({ ...current, salaryMin: event.target.value }))} placeholder="Min salary (k)" className="h-11 flex-1 rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60" />
                  <input value={newJob.salaryMax} onChange={(event) => setNewJob((current) => ({ ...current, salaryMax: event.target.value }))} placeholder="Max salary (k)" className="h-11 flex-1 rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60" />
                </div>
                <div className="flex gap-3 lg:col-span-2">
                  <select
                    value={newJob.type}
                    onChange={(event) => setNewJob((current) => ({ ...current, type: event.target.value }))}
                    title="Job type"
                    aria-label="Job type"
                    className="h-11 flex-1 rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Hybrid</option>
                    <option>Remote</option>
                    <option>Contract</option>
                  </select>
                  <select
                    value={newJob.level}
                    onChange={(event) => setNewJob((current) => ({ ...current, level: event.target.value as "Entry" | "Mid" | "Senior" | "Lead" }))}
                    title="Experience level"
                    aria-label="Experience level"
                    className="h-11 flex-1 rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60"
                  >
                    <option value="Entry">Entry</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
                <input value={newJob.requiredSkills} onChange={(event) => setNewJob((current) => ({ ...current, requiredSkills: event.target.value }))} placeholder="Skills required (comma separated)" className="h-11 rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60 lg:col-span-3" />
                <textarea value={newJob.description} onChange={(event) => setNewJob((current) => ({ ...current, description: event.target.value }))} placeholder="Job description" className="min-h-24 rounded-2xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60 lg:col-span-3" />
                <div className="flex gap-3 lg:col-span-1">
                  <button type="button" onClick={createJob} className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all hover:scale-105 h-11 flex items-center justify-center">
                    Add Job
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {jobs.map((job) => (
                <article key={job.id} className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-800/20 p-6 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-display text-xl font-semibold text-foreground">{job.title}</h4>
                        {job.featured && <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-200/40 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1"><Star className="h-3 w-3" /> Featured</span>}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground font-medium">
                        {job.location} • {job.remotePolicy} • {job.type} • {job.salary} • {job.level}
                      </p>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{job.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill) => (
                          <span key={`${job.id}-${skill}`} className="rounded-full bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-200/40 dark:border-blue-800/40 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <p className="mt-4 text-xs text-muted-foreground font-medium">
                        Posted {job.postedAt} • {job.applicants} applicants
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => toggleFeatured(job.id)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/40 px-4 text-sm font-semibold text-foreground transition-all hover:bg-blue-500/10 hover:border-blue-300/40">
                        <Star className="h-4 w-4" />
                        {job.featured ? "Unfeature" : "Feature"}
                      </button>
                      <button type="button" onClick={() => removeJob(job.id)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-destructive/40 px-4 text-sm font-semibold text-destructive transition-all hover:bg-destructive/10">
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
            <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-800/20 p-6 shadow-lg">
              <div className="mb-5 flex items-center gap-2 text-foreground">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="font-display text-xl font-semibold">Candidate filtering system</h3>
              </div>

              <div className="grid gap-4 lg:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input value={candidateSearch} onChange={(event) => setCandidateSearch(event.target.value)} placeholder="Search candidate" className="h-11 w-full rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60" />
                </div>
                <select
                  value={candidateStatus}
                  onChange={(event) => setCandidateStatus(event.target.value as ApplicantStatus | "All")}
                  title="Applicant status filter"
                  aria-label="Applicant status filter"
                  className="h-11 rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60"
                >
                  <option value="All">All statuses</option>
                  <option value="New">New</option>
                  <option value="Reviewing">Reviewing</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <input value={candidateSkill} onChange={(event) => setCandidateSkill(event.target.value)} placeholder="Filter by skill" className="h-11 rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60" />
                <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-200/40 dark:border-blue-800/40 px-4 py-3 text-sm text-foreground">
                  <p className="font-semibold">{filteredApplicants.length} candidates</p>
                  <p className="text-xs text-muted-foreground mt-1">Min match: {candidateMinMatch}%</p>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    title="Minimum match score"
                    aria-label="Minimum match score"
                    value={candidateMinMatch}
                    onChange={(event) => setCandidateMinMatch(Number(event.target.value))}
                    className="mt-2 w-full accent-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredApplicants.map((applicant) => (
                <article key={applicant.id} className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-800/20 p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img src={applicant.avatar} alt={applicant.name} className="h-16 w-16 rounded-xl object-cover ring-3 ring-blue-500/20" />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-transparent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display text-lg font-bold text-foreground">{applicant.name}</h4>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1 ${applicantStatusClasses[applicant.status]}`}>
                            {applicant.status === "Accepted" && <CheckCircle2 className="h-3 w-3" />}
                            {applicant.status}
                          </span>
                          <span className="rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-200/40 dark:border-emerald-800/40 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                            <Zap className="h-3 w-3" /> {applicant.match}% match
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground font-medium">
                          {applicant.role} • Applied for {applicant.appliedFor}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {applicant.skills.map((skill) => (
                            <span key={skill} className="rounded-full bg-gradient-to-r from-violet-500/10 to-violet-600/10 border border-violet-200/40 dark:border-violet-800/40 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <textarea
                          value={applicant.notes ?? ""}
                          onChange={(event) => updateApplicantNotes(applicant.id, event.target.value)}
                          placeholder="Recruiter notes..."
                          className="mt-3 min-h-20 w-full rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-3 py-2 text-xs outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => updateApplicantStatus(applicant.id, "Accepted")} className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all hover:scale-105">
                        <CheckCircle2 className="h-4 w-4" />
                        Accept
                      </button>
                      <button type="button" onClick={() => updateApplicantStatus(applicant.id, "Rejected")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-destructive/40 px-4 text-sm font-semibold text-destructive transition-all hover:bg-destructive/10">
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="interviews" className="mt-0 space-y-6">
            <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-800/20 p-6 shadow-lg">
              <div className="flex items-center gap-2 text-foreground mb-5">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                <h3 className="font-display text-xl font-semibold">Interview scheduling</h3>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-5">
                <input value={newInterview.candidate} onChange={(event) => setNewInterview((current) => ({ ...current, candidate: event.target.value }))} placeholder="Candidate name" title="Candidate name" className="h-11 rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60" />
                <input value={newInterview.role} onChange={(event) => setNewInterview((current) => ({ ...current, role: event.target.value }))} placeholder="Role" title="Role" className="h-11 rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60" />
                <input type="date" value={newInterview.date} onChange={(event) => setNewInterview((current) => ({ ...current, date: event.target.value }))} title="Interview date" aria-label="Interview date" className="h-11 rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60" />
                <input type="time" value={newInterview.time} onChange={(event) => setNewInterview((current) => ({ ...current, time: event.target.value }))} title="Interview time" aria-label="Interview time" className="h-11 rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60" />
                <div className="flex gap-3">
                  <select
                    value={newInterview.mode}
                    onChange={(event) => setNewInterview((current) => ({ ...current, mode: event.target.value as InterviewMode }))}
                    title="Interview mode"
                    aria-label="Interview mode"
                    className="h-11 flex-1 rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60"
                  >
                    <option value="Video">Video</option>
                    <option value="Phone">Phone</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                  <button type="button" onClick={scheduleInterview} className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all hover:scale-105 h-11 flex items-center justify-center">
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {interviews.map((interview) => (
                <article key={interview.id} className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-800/20 p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h4 className="font-display text-lg font-bold text-foreground">{interview.candidate}</h4>
                      <p className="mt-2 text-sm text-muted-foreground font-medium">{interview.role}</p>
                    </div>
                    <span className="rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-200/40 dark:border-blue-800/40 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">{interview.mode}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium pt-4 border-t border-border/20">
                    <Clock className="h-4 w-4 text-blue-600" />
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
              <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-800/20 p-6 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Total applicants</p>
                <p className="mt-6 font-display text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">{applicants.length}</p>
              </div>
              <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-800/20 p-6 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Accepted candidates</p>
                <p className="mt-6 font-display text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">{acceptedApplicants}</p>
              </div>
              <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-800/20 p-6 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Hiring conversion</p>
                <p className="mt-6 font-display text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{conversionRate}%</p>
              </div>
              <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-800/20 p-6 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Avg job demand</p>
                <p className="mt-6 font-display text-4xl font-bold bg-gradient-to-r from-violet-600 to-violet-700 bg-clip-text text-transparent">
                  {jobs.length ? Math.round(jobs.reduce((sum, job) => sum + job.applicants, 0) / jobs.length) : 0}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-800/20 p-6 shadow-lg">
                <div className="flex items-center gap-2 text-foreground mb-6">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <h3 className="font-display text-xl font-semibold">Job demand overview</h3>
                </div>
                <div className="space-y-5">
                  {jobs.map((job) => {
                    const width = Math.max(12, Math.min(100, job.applicants * 3));
                    return (
                      <div key={job.id}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-semibold text-foreground">{job.title}</span>
                          <span className="text-xs font-bold text-muted-foreground">{job.applicants} applicants</span>
                        </div>
                        <Progress value={barValue(width)} className="h-3 bg-slate-200 dark:bg-slate-700" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-800/20 p-6 shadow-lg">
                <div className="flex items-center gap-2 text-foreground mb-6">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-display text-xl font-semibold">Hiring health</h3>
                </div>
                <div className="space-y-5">
                  {[
                    { label: "Profile completeness", value: 94 },
                    { label: "Interview pipeline", value: 68 },
                    { label: "Featured job reach", value: 81 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-foreground">{item.label}</span>
                        <span className="text-xs font-bold text-muted-foreground">{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-3 bg-slate-200 dark:bg-slate-700" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="posts" className="mt-0 space-y-6">
            <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-800/20 p-6 shadow-lg">
              <div className="mb-5 flex items-center gap-2 text-foreground">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h3 className="font-display text-xl font-semibold">Company posts</h3>
              </div>
              <div className="grid gap-4">
                <input value={newPost.title} onChange={(event) => setNewPost((current) => ({ ...current, title: event.target.value }))} placeholder="Post title" className="h-11 rounded-xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60" />
                <textarea value={newPost.body} onChange={(event) => setNewPost((current) => ({ ...current, body: event.target.value }))} placeholder="Share a company update..." className="min-h-32 rounded-2xl border border-border/40 bg-white dark:bg-slate-900/40 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-border/60" />
                <div className="flex justify-end">
                  <button type="button" onClick={publishPost} className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all hover:scale-105">
                    Publish post
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {posts.map((post) => (
                <article key={post.id} className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-800/20 p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h4 className="font-display text-lg font-bold text-foreground">{post.title}</h4>
                    <span className="text-xs font-semibold text-muted-foreground bg-white/50 dark:bg-slate-900/50 px-3 py-1 rounded-full">{post.createdAt}</span>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground font-medium">{post.body}</p>
                </article>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
