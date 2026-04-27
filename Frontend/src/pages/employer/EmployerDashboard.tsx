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
  Camera,
  Upload,
  MapPin,
  Globe,
  Save,
  ExternalLink,
  Linkedin,
  Twitter,
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

const employerTabs = [
  { value: "company", label: "Company Profile", icon: Building2 },
  { value: "jobs", label: "Job Posts", icon: Briefcase },
  { value: "applicants", label: "Applicants", icon: Users },
  { value: "interviews", label: "Interviews", icon: CalendarDays },
  { value: "analytics", label: "Hiring Analytics", icon: BarChart3 },
  { value: "posts", label: "Company Posts", icon: MessageSquare },
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
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/40 bg-card shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-violet-50/50 dark:from-blue-950/20 dark:to-violet-950/20" />
          <div className="relative p-8 md:p-12 flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 px-3 py-1 border border-amber-200/50 dark:border-amber-700/50">
                <Star className="h-4 w-4 text-amber-600 dark:text-amber-400 fill-amber-500" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Premium Workspace</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                Hiring Control Center
              </h1>
              <p className="max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
                Manage your entire recruitment pipeline with advanced analytics, applicant tracking, and hiring intelligence all in one powerful dashboard.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                {employerBadges.map((badge) => (
                  <div key={badge.label} className="inline-flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-2 text-sm font-medium text-secondary-foreground border border-border/50">
                    <badge.icon className={`h-4 w-4 ${badge.color}`} />
                    {badge.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 rounded-[1.5rem] border border-border/50 bg-background/80 p-6 shadow-sm backdrop-blur-xl w-full lg:w-[320px]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full overflow-hidden border-[2px] border-amber-400 dark:border-amber-500 shadow-sm bg-secondary relative z-10">
                      <img src={user?.avatar} alt={user?.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 z-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full p-[3px] border-2 border-background shadow-sm">
                      <Star className="h-2.5 w-2.5 text-white fill-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{user?.name}</p>
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 tracking-wide uppercase mt-0.5">Premium</p>
                  </div>
                </div>
                <NotificationsBell variant="panel" />
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3 border border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">Hiring Health</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-sm font-bold text-foreground">Excellent</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/messages")}
                    className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Messages
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {panelStats.map((item) => {
            const Icon = item.icon;
            const value = item.getValue(jobs, applicants, interviews);
            return (
              <div key={item.label} className="group relative rounded-[1.5rem] border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/80 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="font-display text-4xl font-bold tracking-tight text-foreground">{value}</p>
                </div>
              </div>
            );
          })}
        </section>

        <Tabs defaultValue="company" className="space-y-8">
          <TabsList className="flex h-auto w-full justify-start gap-8 border-b border-border/50 bg-transparent p-0 overflow-x-auto overflow-y-hidden scrollbar-hide rounded-none mb-8">
            {employerTabs.map((tab) => {
              const Icon = tab.icon;
              const isCompanyTab = tab.value === "company";
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`group relative rounded-none border-b-2 border-transparent bg-transparent px-1 pb-4 pt-2 text-sm font-semibold text-muted-foreground shadow-none data-[state=active]:shadow-none data-[state=active]:bg-transparent transition-colors whitespace-nowrap ${
                    isCompanyTab
                      ? "data-[state=active]:border-amber-500 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-300 hover:text-amber-700 dark:hover:text-amber-300"
                      : "data-[state=active]:border-primary data-[state=active]:text-foreground hover:text-foreground"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-md transition-all ${
                        isCompanyTab
                          ? "bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700 dark:from-amber-900/40 dark:to-amber-800/30 dark:text-amber-300 group-data-[state=active]:bg-gradient-to-br group-data-[state=active]:from-amber-500 group-data-[state=active]:to-orange-500 group-data-[state=active]:text-white group-data-[state=active]:shadow-sm"
                          : "bg-secondary/70 text-muted-foreground group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className={isCompanyTab ? "tracking-[0.01em]" : undefined}>{tab.label}</span>
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="company" className="mt-0">
            <div className="flex flex-col gap-6">
              
              {/* Profile Header & Banner */}
              <div className="relative rounded-[2rem] overflow-hidden border border-border/50 bg-card shadow-sm group">
                <div className="h-48 md:h-64 w-full bg-secondary/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20 z-10" />
                  <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover mix-blend-overlay opacity-60 dark:opacity-30" alt="Cover" />
                  <button className="absolute top-4 right-4 z-20 bg-background/80 hover:bg-background backdrop-blur-md text-foreground text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2 transition-all border border-border/50">
                    <Camera className="w-4 h-4" /> <span className="hidden sm:inline">Change Cover</span>
                  </button>
                </div>
                
                <div className="px-6 md:px-12 pb-8 pt-0 relative flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 md:-mt-20 z-20">
                  <div className="relative group/avatar cursor-pointer shrink-0">
                    <div className="h-32 w-32 md:h-40 md:w-40 rounded-3xl border-[6px] border-card bg-white shadow-sm overflow-hidden relative">
                      <img src={companyProfile.logo} className="w-full h-full object-cover" alt="Logo" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-2 text-white">
                          <Upload className="w-6 h-6" />
                          <span className="text-xs font-bold">Update Logo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 pb-2">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">{companyProfile.name}</h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm font-medium text-muted-foreground">
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-foreground/50" /> {companyProfile.headquarters || "Add Headquarters"}</span>
                      <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-foreground/50" /> <a href="#" className="hover:text-foreground hover:underline underline-offset-4">{companyProfile.website || "Add Website"}</a></span>
                      <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-foreground/50" /> {companyProfile.size || "Add Size"}</span>
                    </div>
                  </div>
                  
                  <div className="pb-2 w-full md:w-auto flex">
                    <button className="w-full bg-primary text-primary-foreground font-semibold text-sm px-8 py-3 rounded-xl shadow-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" /> Save Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
                 <div className="space-y-6">
                    {/* Primary Info Card */}
                    <div className="rounded-[2rem] border border-border/50 bg-card p-6 md:p-8 shadow-sm">
                      <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-3 border-b border-border/50 pb-4">
                        <span className="p-2 bg-secondary rounded-xl"><Building2 className="w-5 h-5 text-foreground" /></span>
                        Basic Information
                      </h3>
                      
                      <div className="grid gap-6 sm:grid-cols-2">
                        <label className="text-sm text-foreground">
                          <span className="mb-2 block font-semibold text-muted-foreground">Company name</span>
                          <input value={companyProfile.name} onChange={(e) => setCompanyProfile(c => ({ ...c, name: e.target.value }))} className="h-12 w-full rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border" />
                        </label>
                        <label className="text-sm text-foreground">
                          <span className="mb-2 block font-semibold text-muted-foreground">Industry</span>
                          <input value={companyProfile.industry} onChange={(e) => setCompanyProfile(c => ({ ...c, industry: e.target.value }))} className="h-12 w-full rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border" />
                        </label>
                        <label className="text-sm text-foreground">
                          <span className="mb-2 block font-semibold text-muted-foreground">Company size</span>
                          <select value={companyProfile.size} onChange={(e) => setCompanyProfile(c => ({ ...c, size: e.target.value }))} className="h-12 w-full rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border appearance-none">
                            <option>1-10 employees</option>
                            <option>11-50 employees</option>
                            <option>51-200 employees</option>
                            <option>201-500 employees</option>
                            <option>500+ employees</option>
                            <option>10,000+ employees</option>
                          </select>
                        </label>
                        <label className="text-sm text-foreground">
                          <span className="mb-2 block font-semibold text-muted-foreground">Headquarters</span>
                          <input value={companyProfile.headquarters} onChange={(e) => setCompanyProfile(c => ({ ...c, headquarters: e.target.value }))} className="h-12 w-full rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border" />
                        </label>
                        <label className="text-sm text-foreground sm:col-span-2">
                          <span className="mb-2 block font-semibold text-muted-foreground">About Us</span>
                          <textarea value={companyProfile.description} onChange={(e) => setCompanyProfile(c => ({ ...c, description: e.target.value }))} className="min-h-40 w-full rounded-xl border border-border/50 bg-background px-4 py-4 font-medium leading-relaxed outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border resize-none" />
                        </label>
                      </div>
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    {/* Social & Links Card */}
                    <div className="rounded-[2rem] border border-border/50 bg-card p-6 md:p-8 shadow-sm">
                      <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-3 border-b border-border/50 pb-4">
                        <span className="p-2 bg-secondary rounded-xl"><ExternalLink className="w-5 h-5 text-foreground" /></span>
                        Digital Presence
                      </h3>
                      
                      <div className="space-y-5">
                        <label className="text-sm text-foreground relative block">
                          <span className="mb-2 block font-semibold text-muted-foreground">Website</span>
                          <div className="relative">
                            <Globe className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                            <input value={companyProfile.website} onChange={(e) => setCompanyProfile(c => ({ ...c, website: e.target.value }))} placeholder="https://" className="h-12 w-full rounded-xl border border-border/50 bg-background pl-11 pr-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border" />
                          </div>
                        </label>
                        <label className="text-sm text-foreground relative block">
                          <span className="mb-2 block font-semibold text-muted-foreground">LinkedIn</span>
                          <div className="relative">
                            <Linkedin className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                            <input placeholder="linkedin.com/company/..." className="h-12 w-full rounded-xl border border-border/50 bg-background pl-11 pr-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border" />
                          </div>
                        </label>
                        <label className="text-sm text-foreground relative block">
                          <span className="mb-2 block font-semibold text-muted-foreground">Twitter / X</span>
                          <div className="relative">
                            <Twitter className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                            <input placeholder="twitter.com/..." className="h-12 w-full rounded-xl border border-border/50 bg-background pl-11 pr-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border" />
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="rounded-[2rem] border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 p-6 md:p-8 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="font-display text-lg font-bold text-blue-900 dark:text-blue-100">Premium Employer</h3>
                      </div>
                      <p className="text-sm text-blue-800/80 dark:text-blue-200/80 leading-relaxed font-medium mb-6">Stand out to top tier candidates by verifying your company page and adding culture videos.</p>
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-3 rounded-xl shadow-sm transition-colors">
                        Upgrade Profile
                      </button>
                    </div>
                 </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="mt-0 space-y-8">
            {/* Create Job Form Area */}
            <div className="rounded-[2rem] border border-border/50 bg-card p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 text-foreground mb-6 border-b border-border/50 pb-4">
                <div className="p-2 bg-secondary rounded-xl">
                  <Briefcase className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold">Post a New Role</h3>
                  <p className="text-sm text-muted-foreground font-medium mt-0.5">Fill out the details below to publish a new job opening.</p>
                </div>
              </div>
              
              <div className="grid gap-6 lg:grid-cols-4">
                <div className="lg:col-span-2 relative">
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">Job Title</label>
                  <input value={newJob.title} onChange={(event) => setNewJob((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. Senior Frontend Engineer" className="h-12 w-full rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border" />
                </div>
                <div className="relative">
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <input value={newJob.location} onChange={(event) => setNewJob((current) => ({ ...current, location: event.target.value }))} placeholder="City, State" className="h-12 w-full rounded-xl border border-border/50 bg-background pl-10 pr-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border" />
                  </div>
                </div>
                <div className="relative">
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">Workplace Type</label>
                  <select value={newJob.remotePolicy} onChange={(event) => setNewJob((current) => ({ ...current, remotePolicy: event.target.value as "Onsite" | "Hybrid" | "Remote" }))} className="h-12 w-full rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border appearance-none">
                    <option value="Onsite">🏢 Onsite</option>
                    <option value="Hybrid">🏠 Hybrid</option>
                    <option value="Remote">🌍 Remote</option>
                  </select>
                </div>
                
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-2 block">Min Salary ($k)</label>
                    <input type="number" value={newJob.salaryMin} onChange={(event) => setNewJob((current) => ({ ...current, salaryMin: event.target.value }))} placeholder="80" className="h-12 w-full rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-2 block">Max Salary ($k)</label>
                    <input type="number" value={newJob.salaryMax} onChange={(event) => setNewJob((current) => ({ ...current, salaryMax: event.target.value }))} placeholder="120" className="h-12 w-full rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border" />
                  </div>
                </div>
                
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-2 block">Employment Type</label>
                    <select value={newJob.type} onChange={(event) => setNewJob((current) => ({ ...current, type: event.target.value }))} className="h-12 w-full rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border appearance-none">
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-2 block">Experience Level</label>
                    <select value={newJob.level} onChange={(event) => setNewJob((current) => ({ ...current, level: event.target.value as "Entry" | "Mid" | "Senior" | "Lead" }))} className="h-12 w-full rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border appearance-none">
                      <option value="Entry">Entry Level</option>
                      <option value="Mid">Mid Level</option>
                      <option value="Senior">Senior Level</option>
                      <option value="Lead">Lead / Staff</option>
                    </select>
                  </div>
                </div>
                
                <div className="lg:col-span-4">
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">Required Skills</label>
                  <input value={newJob.requiredSkills} onChange={(event) => setNewJob((current) => ({ ...current, requiredSkills: event.target.value }))} placeholder="React, TypeScript, Node.js (comma separated)" className="h-12 w-full rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border" />
                </div>
                
                <div className="lg:col-span-4 relative">
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">Job Description</label>
                  <textarea value={newJob.description} onChange={(event) => setNewJob((current) => ({ ...current, description: event.target.value }))} placeholder="Describe the responsibilities and requirements..." className="min-h-32 w-full rounded-xl border border-border/50 bg-background px-4 py-3 font-medium leading-relaxed outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border resize-none" />
                </div>
                
                <div className="lg:col-span-4 flex justify-end pt-2">
                  <button type="button" onClick={createJob} className="rounded-xl bg-primary px-8 h-12 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" /> Publish Job Post
                  </button>
                </div>
              </div>
            </div>

            {/* Active Jobs List */}
            <div className="space-y-6">
              <h3 className="font-display text-xl font-bold text-foreground">Active Listings ({jobs.length})</h3>
              <div className="grid gap-6 lg:grid-cols-2">
                {jobs.map((job) => (
                  <article key={job.id} className="relative rounded-[2rem] border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-display text-2xl font-bold text-foreground leading-tight tracking-tight">{job.title}</h4>
                            {job.featured && <span className="rounded-md bg-amber-500/10 border border-amber-200/50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1"><Star className="h-3 w-3 fill-amber-500" /> Featured</span>}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-muted-foreground">
                            <span className="flex items-center gap-1 text-foreground"><MapPin className="w-4 h-4 text-muted-foreground" /> {job.location}</span>
                            <span>•</span>
                            <span className="text-foreground">{job.remotePolicy}</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{job.salary}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" onClick={() => toggleFeatured(job.id)} className={`p-2 rounded-lg border transition-colors ${job.featured ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-background border-border/50 text-muted-foreground hover:bg-secondary hover:text-foreground'}`} title={job.featured ? "Unfeature" : "Feature"}>
                            <Star className={`w-4 h-4 ${job.featured ? 'fill-amber-500' : ''}`} />
                          </button>
                          <button type="button" onClick={() => removeJob(job.id)} className="p-2 rounded-lg border border-border/50 bg-background text-muted-foreground hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-colors" title="Close Job">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-secondary/40 rounded-2xl p-4 mb-5 border border-border/50">
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-2">{job.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.requiredSkills.slice(0, 4).map((skill) => (
                            <span key={`${job.id}-${skill}`} className="rounded-md bg-background border border-border/50 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
                              {skill}
                            </span>
                          ))}
                          {job.requiredSkills.length > 4 && <span className="text-xs font-medium text-muted-foreground self-center">+{job.requiredSkills.length - 4} more</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-background flex items-center justify-center text-xs font-bold text-blue-700 z-30">A</div>
                          <div className="w-8 h-8 rounded-full bg-violet-100 border-2 border-background flex items-center justify-center text-xs font-bold text-violet-700 z-20">B</div>
                          <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-background flex items-center justify-center text-xs font-bold text-emerald-700 z-10">C</div>
                        </div>
                        <span className="text-sm font-semibold text-foreground ml-2">{job.applicants} Applicants</span>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Posted {job.postedAt}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="applicants" className="mt-0 space-y-8">
            {/* Candidate Filters */}
            <div className="rounded-[2rem] border border-border/50 bg-card p-6 md:p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-3 text-foreground">
                  <div className="p-2 bg-secondary rounded-xl">
                    <Users className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">Candidate Pipeline</h3>
                    <p className="text-sm text-muted-foreground font-medium mt-0.5">Filter and review applicants for your open positions.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="relative">
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <input value={candidateSearch} onChange={(event) => setCandidateSearch(event.target.value)} placeholder="Name or email..." className="h-12 w-full rounded-xl border border-border/50 bg-background pl-10 pr-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border" />
                  </div>
                </div>
                <div className="relative">
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">Status Stage</label>
                  <select
                    value={candidateStatus}
                    onChange={(event) => setCandidateStatus(event.target.value as ApplicantStatus | "All")}
                    className="h-12 w-full rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border appearance-none"
                  >
                    <option value="All">All Candidates</option>
                    <option value="New">🟢 New Applications</option>
                    <option value="Reviewing">🟡 In Review</option>
                    <option value="Accepted">🔵 Offer Extended</option>
                    <option value="Rejected">🔴 Rejected</option>
                  </select>
                </div>
                <div className="relative">
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">Required Skill</label>
                  <input value={candidateSkill} onChange={(event) => setCandidateSkill(event.target.value)} placeholder="e.g. React" className="h-12 w-full rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border" />
                </div>
                <div className="rounded-2xl border border-border/50 bg-secondary/50 p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-semibold text-foreground">AI Match Score</label>
                    <span className="text-sm font-bold text-primary">{candidateMinMatch}%+</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={candidateMinMatch}
                    onChange={(event) => setCandidateMinMatch(Number(event.target.value))}
                    className="w-full accent-primary mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Candidate List */}
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-foreground">Showing {filteredApplicants.length} Candidates</h3>
              <div className="grid gap-4">
                {filteredApplicants.map((applicant) => (
                  <article key={applicant.id} className="rounded-[1.5rem] border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-all flex flex-col xl:flex-row xl:items-center gap-6">
                    
                    <div className="flex items-center gap-5 xl:w-[30%]">
                      <div className="relative shrink-0">
                        <img src={applicant.avatar} alt={applicant.name} className="h-16 w-16 md:h-20 md:w-20 rounded-2xl object-cover ring-1 ring-border" />
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-[3px] border-card text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-white" /> {applicant.match}%
                        </div>
                      </div>
                      <div>
                        <h4 className="font-display text-xl font-bold text-foreground tracking-tight">{applicant.name}</h4>
                        <p className="text-sm font-medium text-muted-foreground mt-0.5">{applicant.role}</p>
                        <p className="text-xs font-medium text-foreground mt-1">Applied for <span className="font-semibold">{applicant.appliedFor}</span></p>
                      </div>
                    </div>
                    
                    <div className="xl:flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Top Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {applicant.skills.slice(0,5).map((skill) => (
                            <span key={skill} className="bg-background border border-border/50 text-foreground px-2.5 py-1 rounded-md text-[11px] font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="relative">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Internal Notes</p>
                        <textarea
                          value={applicant.notes ?? ""}
                          onChange={(event) => updateApplicantNotes(applicant.id, event.target.value)}
                          placeholder="Add private recruiter notes here..."
                          className="w-full h-16 rounded-xl border border-border/50 bg-background px-3 py-2 text-xs font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row xl:flex-col items-center gap-3 xl:w-[15%] shrink-0">
                      <div className={`w-full text-center rounded-xl py-2 px-3 text-xs font-semibold border flex items-center justify-center gap-1.5 ${applicant.status === 'Accepted' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800' : applicant.status === 'Rejected' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800' : applicant.status === 'Reviewing' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800'}`}>
                        {applicant.status === "Accepted" && <CheckCircle2 className="h-4 w-4" />}
                        {applicant.status}
                      </div>
                      <div className="w-full grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => updateApplicantStatus(applicant.id, "Accepted")} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 flex items-center justify-center transition-colors shadow-sm" title="Accept Candidate">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => updateApplicantStatus(applicant.id, "Rejected")} className="bg-background hover:bg-destructive/10 hover:text-destructive text-muted-foreground rounded-lg py-2 flex items-center justify-center transition-colors border border-border/50 hover:border-destructive/30" title="Reject Candidate">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="interviews" className="mt-0 space-y-8">
            <div className="rounded-[2rem] border border-border/50 bg-card p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 text-foreground mb-6 border-b border-border/50 pb-4">
                <div className="p-2 bg-secondary rounded-xl">
                  <CalendarDays className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold">Schedule Interview</h3>
                  <p className="text-sm text-muted-foreground font-medium mt-0.5">Set up an interview with a candidate.</p>
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-5">
                <div className="relative">
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">Candidate</label>
                  <input value={newInterview.candidate} onChange={(event) => setNewInterview((current) => ({ ...current, candidate: event.target.value }))} placeholder="Candidate name" className="h-12 w-full rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border" />
                </div>
                <div className="relative">
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">Role</label>
                  <input value={newInterview.role} onChange={(event) => setNewInterview((current) => ({ ...current, role: event.target.value }))} placeholder="Position" className="h-12 w-full rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border" />
                </div>
                <div className="relative">
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">Date</label>
                  <input type="date" value={newInterview.date} onChange={(event) => setNewInterview((current) => ({ ...current, date: event.target.value }))} className="h-12 w-full rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border appearance-none" />
                </div>
                <div className="relative">
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">Time</label>
                  <input type="time" value={newInterview.time} onChange={(event) => setNewInterview((current) => ({ ...current, time: event.target.value }))} className="h-12 w-full rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border appearance-none" />
                </div>
                <div className="relative flex items-end">
                  <div className="w-full flex gap-3">
                    <select
                      value={newInterview.mode}
                      onChange={(event) => setNewInterview((current) => ({ ...current, mode: event.target.value as InterviewMode }))}
                      className="h-12 flex-1 rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border appearance-none"
                    >
                      <option value="Video">📹 Video</option>
                      <option value="Phone">📞 Phone</option>
                      <option value="Onsite">🏢 Onsite</option>
                    </select>
                    <button type="button" onClick={scheduleInterview} className="rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all h-12 flex items-center justify-center">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {interviews.map((interview) => (
                <article key={interview.id} className="rounded-[2rem] border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-violet-500" />
                  <div className="flex items-start justify-between gap-4 mb-5 mt-1">
                    <div>
                      <h4 className="font-display text-xl font-bold text-foreground">{interview.candidate}</h4>
                      <p className="mt-1 text-sm text-muted-foreground font-medium">{interview.role}</p>
                    </div>
                    <span className="rounded-lg bg-secondary/50 border border-border/50 px-2.5 py-1 text-[11px] font-semibold text-foreground">{interview.mode}</span>
                  </div>
                  <div className="flex flex-col gap-3 text-sm font-medium pt-4 border-t border-border/50">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="p-2 bg-secondary rounded-lg"><CalendarDays className="h-4 w-4 text-foreground" /></div>
                      <span className="text-foreground">{new Date(interview.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="p-2 bg-secondary rounded-lg"><Clock className="h-4 w-4 text-foreground" /></div>
                      <span className="text-foreground">{interview.time}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0 space-y-8">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[2rem] border border-border/50 bg-card p-6 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
                <p className="text-sm font-semibold text-muted-foreground">Total Pipeline</p>
                <div className="mt-4 flex items-end gap-3">
                  <p className="font-display text-5xl font-bold text-foreground tracking-tight">{applicants.length}</p>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 px-2 py-1 rounded-md mb-1">+12%</span>
                </div>
              </div>
              <div className="rounded-[2rem] border border-border/50 bg-card p-6 shadow-sm relative overflow-hidden">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
                <p className="text-sm font-semibold text-muted-foreground">Offers Accepted</p>
                <div className="mt-4 flex items-end gap-3">
                  <p className="font-display text-5xl font-bold text-foreground tracking-tight">{acceptedApplicants}</p>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 px-2 py-1 rounded-md mb-1">+4%</span>
                </div>
              </div>
              <div className="rounded-[2rem] border border-border/50 bg-card p-6 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl" />
                <p className="text-sm font-semibold text-muted-foreground">Conversion Rate</p>
                <div className="mt-4 flex items-end gap-3">
                  <p className="font-display text-5xl font-bold text-foreground tracking-tight">{conversionRate}%</p>
                </div>
              </div>
              <div className="rounded-[2rem] border border-border/50 bg-card p-6 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
                <p className="text-sm font-semibold text-muted-foreground">Avg Demand</p>
                <div className="mt-4 flex items-end gap-3">
                  <p className="font-display text-5xl font-bold text-foreground tracking-tight">
                    {jobs.length ? Math.round(jobs.reduce((sum, job) => sum + job.applicants, 0) / jobs.length) : 0}
                  </p>
                  <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded-md mb-1">/ job</span>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[2rem] border border-border/50 bg-card p-8 shadow-sm">
                <div className="flex items-center gap-3 text-foreground mb-8 border-b border-border/50 pb-4">
                  <div className="p-2 bg-secondary rounded-xl">
                    <BarChart3 className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-bold">Job Post Performance</h3>
                </div>
                <div className="space-y-6">
                  {jobs.map((job) => {
                    const width = Math.max(12, Math.min(100, job.applicants * 3));
                    return (
                      <div key={job.id} className="group">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="font-semibold text-sm text-foreground">{job.title}</span>
                          <span className="text-xs font-medium text-muted-foreground">{job.applicants} applicants</span>
                        </div>
                        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${barValue(width)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[2rem] border border-border/50 bg-card p-8 shadow-sm">
                <div className="flex items-center gap-3 text-foreground mb-8 border-b border-border/50 pb-4">
                  <div className="p-2 bg-secondary rounded-xl">
                    <TrendingUp className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-bold">Recruiting Efficiency</h3>
                </div>
                <div className="space-y-6">
                  {[
                    { label: "Profile Match Quality", value: 94, color: "bg-emerald-500" },
                    { label: "Interview Pipeline Speed", value: 68, color: "bg-amber-500" },
                    { label: "Featured Reach Success", value: 81, color: "bg-blue-500" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-3 flex items-center justify-between text-sm">
                        <span className="font-semibold text-foreground">{item.label}</span>
                        <span className="text-xs font-medium text-muted-foreground">{item.value}%</span>
                      </div>
                      <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} transition-all duration-1000 ease-out`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="posts" className="mt-0 space-y-8">
            <div className="rounded-[2rem] border border-border/50 bg-card p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 text-foreground mb-6 border-b border-border/50 pb-4">
                <div className="p-2 bg-secondary rounded-xl">
                  <MessageSquare className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold">Company Posts</h3>
                  <p className="text-sm text-muted-foreground font-medium mt-0.5">Share updates, milestones, and culture with your followers.</p>
                </div>
              </div>
              
              <div className="grid gap-5">
                <div className="relative">
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">Post Title</label>
                  <input value={newPost.title} onChange={(event) => setNewPost((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. We just raised our Series A!" className="h-12 w-full rounded-xl border border-border/50 bg-background px-4 font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border" />
                </div>
                <div className="relative">
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">Content</label>
                  <textarea value={newPost.body} onChange={(event) => setNewPost((current) => ({ ...current, body: event.target.value }))} placeholder="Write your update here..." className="min-h-32 w-full rounded-xl border border-border/50 bg-background px-4 py-4 font-medium leading-relaxed outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary hover:border-border resize-none" />
                </div>
                <div className="flex justify-end pt-2">
                  <button type="button" onClick={publishPost} className="rounded-xl bg-primary px-8 h-12 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" /> Publish Post
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <article key={post.id} className="rounded-[2rem] border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex flex-col gap-3 h-full">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="font-display text-lg font-bold text-foreground leading-tight">{post.title}</h4>
                      <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-lg shrink-0">{post.createdAt}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground font-medium flex-1">{post.body}</p>
                    <div className="pt-4 border-t border-border/50 flex items-center gap-4 mt-2">
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                        <Users className="w-4 h-4" /> 0 Likes
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                        <MessageSquare className="w-4 h-4" /> 0 Comments
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
