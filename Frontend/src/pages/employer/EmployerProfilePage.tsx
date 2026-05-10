import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCompanyProfile, getPosts } from "@/features/employer/api/employerApi";
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Briefcase,
  ExternalLink,
  Linkedin,
  Twitter,
  Star,
  Crown,
  Shield,
  BadgeCheck,
  ChevronRight,
  Settings,
  LogOut,
  Moon,
  SunMedium,
  MessageSquare,
  CalendarDays,
  UserCheck,
  Edit2,
  Save,
  Upload,
  Camera,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Clock,
  Search,
  X,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import NotificationsBell from "@/components/notifications/NotificationsBell";
import {
  companyProfile as initialCompanyProfile,
  companyPosts,
  type CompanyPost,
} from "@/data/employerMockData";

const employerBadges = [
  { icon: BadgeCheck, label: "Verified Employer", color: "text-blue-600" },
  { icon: Crown, label: "Premium Recruiter", color: "text-amber-500" },
  { icon: Shield, label: "Trusted Hiring", color: "text-emerald-600" },
] as const;

export default function EmployerProfilePage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [companyProfile, setCompanyProfile] = useState(initialCompanyProfile);
  const [posts, setPosts] = useState(companyPosts);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [companyRes, postsRes] = await Promise.all([
          getCompanyProfile().catch(() => null),
          getPosts().catch(() => null),
        ]);
        if (companyRes?.data) setCompanyProfile((prev) => ({ ...prev, ...companyRes.data }));
        if (postsRes?.data && postsRes.data.length > 0) setPosts(postsRes.data);
      } catch (e) {
        console.error("Failed to load employer profile data");
      }
    };
    loadData();
  }, []);

  const darkModeEnabled = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const employerTeam = [
    {
      name: user?.name ?? "James Wilson",
      role: "Employer owner",
      company: user?.company ?? companyProfile.name,
      avatar: user?.avatar,
      tone: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    },
    {
      name: "Sarah Jenkins",
      role: "Head of Talent",
      company: companyProfile.name,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      tone: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    {
      name: "Marcus Chen",
      role: "Recruiter",
      company: companyProfile.name,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="mx-auto max-w-[1400px] space-y-8">
        {/* Header Section */}
        <section className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-card shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-transparent to-blue-50/40 dark:from-amber-950/15 dark:via-transparent dark:to-blue-950/20" />
          <div className="absolute -top-24 right-[-4rem] h-64 w-64 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/10 blur-3xl" />
          <div className="absolute -bottom-24 left-[-5rem] h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/10 to-violet-500/10 blur-3xl" />
          <div className="relative p-8 md:p-12 flex flex-col lg:flex-row gap-10 lg:items-center lg:justify-between">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 px-3 py-1.5 border border-amber-200/50 dark:border-amber-700/50 shadow-sm backdrop-blur-sm">
                <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Company Profile</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                {companyProfile.name}
              </h1>
              <p className="max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
                {companyProfile.description}
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

            {/* Right Sidebar Panel */}
            <div className="shrink-0 rounded-[1.75rem] border border-slate-200/70 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-slate-50 shadow-[0_24px_80px_-40px_rgba(30,41,59,0.95)] backdrop-blur-xl w-full lg:w-[360px] ring-1 ring-white/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full overflow-hidden border-[2px] border-amber-300 shadow-sm bg-slate-800/80 relative z-10">
                      <img src={companyProfile.logo} alt={companyProfile.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 z-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full p-[3px] border-2 border-slate-950 shadow-sm">
                      <Crown className="h-2.5 w-2.5 text-white fill-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-50">{companyProfile.name}</p>
                    <p className="text-xs font-semibold text-amber-300 tracking-[0.2em] uppercase mt-0.5">Company Profile</p>
                  </div>
                </div>
                <NotificationsBell variant="panel" />
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Company Details</p>
                    <p className="mt-1 text-sm font-semibold text-slate-50">{companyProfile.industry}</p>
                    <p className="text-xs text-slate-300">{companyProfile.size} • {companyProfile.headquarters}</p>
                  </div>
                  <div className="rounded-xl bg-amber-400/10 px-3 py-2 text-right ring-1 ring-amber-400/20">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">Status</p>
                    <p className="text-sm font-bold text-amber-100">Active</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-white/8 px-4 py-3 border border-white/10">
                  <span className="text-sm font-medium text-slate-300">Company Rating</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-3 w-3 ${star <= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-slate-50">4.0</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Team Members</p>
                      <p className="mt-1 text-sm font-semibold text-slate-50">{employerTeam.length} team members</p>
                    </div>
                    <div className="-space-x-2 flex">
                      {employerTeam.map((member) => (
                        <img
                          key={member.name}
                          src={member.avatar}
                          alt={member.name}
                          className="h-9 w-9 rounded-full border-2 border-slate-950 object-cover shadow-sm"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {employerTeam.map((member, index) => (
                      <div key={member.name} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <img src={member.avatar} alt={member.name} className="h-10 w-10 rounded-full object-cover ring-1 ring-white/15" />
                            {index === 0 && (
                              <div className="absolute -bottom-1 -right-1 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1 text-white shadow-sm">
                                <Crown className="h-2.5 w-2.5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-50">{member.name}</p>
                            <p className="truncate text-xs text-slate-300">{member.role} • {member.company}</p>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-white/10 ${member.tone}`}>{index === 0 ? "Owner" : "Seat"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Link to="/employer" className="inline-flex items-center justify-between rounded-xl border border-white/10 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-slate-50 transition-colors hover:bg-cyan-400/15">
                    <span className="inline-flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-cyan-200" />
                      Employer Dashboard
                    </span>
                    <ChevronRight className="h-4 w-4 text-cyan-200" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setTheme(darkModeEnabled ? "light" : "dark")}
                    className="inline-flex items-center justify-between rounded-xl border border-white/10 bg-violet-400/10 px-4 py-3 text-sm font-semibold text-slate-50 transition-colors hover:bg-violet-400/15"
                  >
                    <span className="inline-flex items-center gap-2">
                      {darkModeEnabled ? <SunMedium className="h-4 w-4 text-violet-200" /> : <Moon className="h-4 w-4 text-violet-200" />}
                      {darkModeEnabled ? "Light mode" : "Dark mode"}
                    </span>
                    <span className="text-xs font-medium text-violet-200/80">Toggle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="inline-flex items-center justify-between rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-50 transition-colors hover:bg-rose-400/15"
                  >
                    <span className="inline-flex items-center gap-2">
                      <LogOut className="h-4 w-4 text-rose-200" />
                      Logout
                    </span>
                    <span className="text-xs font-medium text-rose-200/80">Sign out</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/messages")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-colors hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-400"
                >
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Company Info Stats */}
        <section className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-[1.5rem] border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-blue-500 opacity-80" />
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Industry</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-secondary/90 to-secondary/60 text-foreground ring-1 ring-border/50">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <p className="font-display text-2xl font-bold tracking-tight text-foreground">{companyProfile.industry}</p>
          </div>

          <div className="group relative overflow-hidden rounded-[1.5rem] border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-blue-500 opacity-80" />
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Company Size</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-secondary/90 to-secondary/60 text-foreground ring-1 ring-border/50">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="font-display text-2xl font-bold tracking-tight text-foreground">{companyProfile.size}</p>
          </div>

          <div className="group relative overflow-hidden rounded-[1.5rem] border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-blue-500 opacity-80" />
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Headquarters</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-secondary/90 to-secondary/60 text-foreground ring-1 ring-border/50">
                <MapPin className="h-5 w-5" />
              </div>
            </div>
            <p className="font-display text-2xl font-bold tracking-tight text-foreground">{companyProfile.headquarters}</p>
          </div>

          <div className="group relative overflow-hidden rounded-[1.5rem] border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-blue-500 opacity-80" />
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Website</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-secondary/90 to-secondary/60 text-foreground ring-1 ring-border/50">
                <Globe className="h-5 w-5" />
              </div>
            </div>
            <a
              href={companyProfile.website.startsWith('http') ? companyProfile.website : `https://${companyProfile.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-xl font-bold tracking-tight text-blue-500 hover:text-blue-600 transition-colors truncate block"
            >
              {companyProfile.website}
            </a>
          </div>
        </section>

        {/* Company Details */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* About & Culture */}
            <div className="rounded-[2rem] border border-border/50 bg-card p-6 md:p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3 border-b border-border/50 pb-4">
                <div className="rounded-xl bg-secondary p-2">
                  <Building2 className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">About {companyProfile.name}</h3>
              </div>
              <p className="text-base leading-relaxed text-muted-foreground">{companyProfile.description}</p>

              {companyProfile.culture && (
                <div className="mt-8">
                  <h4 className="font-display text-lg font-bold text-foreground mb-3">Culture & Values</h4>
                  <p className="text-base leading-relaxed text-muted-foreground">{companyProfile.culture}</p>
                </div>
              )}

              {companyProfile.benefits && (
                <div className="mt-8">
                  <h4 className="font-display text-lg font-bold text-foreground mb-3">Benefits & Perks</h4>
                  <div className="flex flex-wrap gap-2">
                    {companyProfile.benefits.split(",").map((benefit, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {benefit.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Company Posts */}
            <div className="rounded-[2rem] border border-border/50 bg-card p-6 md:p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3 border-b border-border/50 pb-4">
                <div className="rounded-xl bg-secondary p-2">
                  <MessageSquare className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">Company News & Updates</h3>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {posts.map((post) => (
                  <article key={post.id} className="rounded-[1.5rem] border border-border/50 bg-card p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex flex-col gap-3 h-full">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="font-display text-lg font-bold text-foreground leading-tight">{post.title}</h4>
                        <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-lg shrink-0">{post.createdAt}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground font-medium flex-1">{post.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-border/50 bg-card p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3 border-b border-border/50 pb-4">
                <div className="rounded-xl bg-secondary p-2">
                  <ExternalLink className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">Digital Presence</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                  <Globe className="h-5 w-5 text-blue-500 shrink-0" />
                  <a
                    href={companyProfile.website.startsWith('http') ? companyProfile.website : `https://${companyProfile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-foreground hover:text-blue-500 transition-colors truncate"
                  >
                    {companyProfile.website}
                  </a>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                  <Linkedin className="h-5 w-5 text-blue-700 shrink-0" />
                  <span className="text-sm font-medium text-muted-foreground">linkedin.com/company/{companyProfile.name.toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                  <Twitter className="h-5 w-5 text-sky-500 shrink-0" />
                  <span className="text-sm font-medium text-muted-foreground">twitter.com/{companyProfile.name.toLowerCase()}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border/50 bg-card p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between border-b border-border/50 pb-4">
                <h3 className="font-display text-lg font-bold text-foreground">Team</h3>
              </div>
              <div className="space-y-3">
                {employerTeam.map((member, index) => (
                  <div key={member.name} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <img src={member.avatar} alt={member.name} className="h-9 w-9 rounded-full object-cover ring-1 ring-border/50" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{member.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-background px-2 py-1 text-[10px] font-semibold text-muted-foreground">{index === 0 ? "Owner" : "Member"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}