import { useMemo, useState } from "react";
import { BellRing, BookmarkCheck, Search, TrendingUp, Sparkles, X, Upload, FileText } from "lucide-react";
import { jobs, currentUser, calculateSmartMatchScore, type Application, type Job } from "@/data/mockData";
import JobCard from "@/components/jobs/JobCard";
import JobFiltersPanel, { JobFilters } from "@/components/jobs/JobFilters";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface JobAlert {
  id: string;
  name: string;
  keywords: string;
  location: string;
}

const SAVED_RESUME_NAME = "Alex-Morgan-Resume.pdf";
const APPLICATIONS_STORAGE_KEY = "joblink.applications";

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<JobFilters>({
    type: "All",
    experienceLevel: "All",
    salaryRange: [0, 300],
    location: "",
    company: "",
    remotePolicy: "All",
    industry: "",
    companySize: "All",
    postedWithinDays: 30,
    visaSupportOnly: false,
    urgentOnly: false,
    minApplicants: 0,
    skills: [],
  });
  const [sortBy, setSortBy] = useState<"match" | "recent">("match");
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [activeApplyJob, setActiveApplyJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState("");

  const filtered = useMemo(() => {
    return jobs
      .filter((job) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.industry.toLowerCase().includes(q) ||
          job.skills.some((s) => s.toLowerCase().includes(q));

        const matchesType = filters.type === "All" || job.type === filters.type;
        const matchesExp = filters.experienceLevel === "All" || job.experienceLevel === filters.experienceLevel;
        const matchesSalary = job.salaryMax >= filters.salaryRange[0] && job.salaryMin <= filters.salaryRange[1];
        const matchesSkills =
          filters.skills.length === 0 ||
          filters.skills.some((s) => job.skills.map((js) => js.toLowerCase()).includes(s.toLowerCase()));
        const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
        const matchesCompany = !filters.company || job.company.toLowerCase().includes(filters.company.toLowerCase());
        const matchesRemote = filters.remotePolicy === "All" || job.remotePolicy === filters.remotePolicy;
        const matchesIndustry = !filters.industry || job.industry.toLowerCase().includes(filters.industry.toLowerCase());
        const matchesCompanySize = filters.companySize === "All" || job.companySize === filters.companySize;
        const matchesVisa = !filters.visaSupportOnly || job.visaSupport;
        const matchesUrgent = !filters.urgentOnly || job.urgentHiring;
        const matchesApplicants = job.applicants >= filters.minApplicants;
        const postedDaysAgo = Math.floor((Date.now() - new Date(job.postedAtISO).getTime()) / (1000 * 60 * 60 * 24));
        const matchesPostedWindow = postedDaysAgo <= filters.postedWithinDays;

        return (
          matchesSearch &&
          matchesType &&
          matchesExp &&
          matchesSalary &&
          matchesSkills &&
          matchesLocation &&
          matchesCompany &&
          matchesRemote &&
          matchesIndustry &&
          matchesCompanySize &&
          matchesVisa &&
          matchesUrgent &&
          matchesApplicants &&
          matchesPostedWindow
        );
      })
      .sort((a, b) => {
        if (sortBy === "match") {
          return calculateSmartMatchScore(currentUser, b) - calculateSmartMatchScore(currentUser, a);
        }

        return new Date(b.postedAtISO).getTime() - new Date(a.postedAtISO).getTime();
      });
  }, [filters, search, sortBy]);

  const handleApplyClick = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) setActiveApplyJob(job);
  };

  const submitApplication = () => {
    if (!activeApplyJob) return;

    if (!SAVED_RESUME_NAME) {
      toast.error("Upload your resume first to apply.");
      return;
    }

    const existing = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
    const parsed: Application[] = existing ? JSON.parse(existing) as Application[] : [];

    if (parsed.some((entry) => entry.jobId === activeApplyJob.id)) {
      toast.info(`You already applied for ${activeApplyJob.title}.`);
      setActiveApplyJob(null);
      return;
    }

    const nextEntry: Application = {
      id: `app-${Date.now()}`,
      jobId: activeApplyJob.id,
      job: activeApplyJob,
      appliedAt: "Just now",
      status: "Applied",
      statusHistory: [{ status: "Applied", date: "Just now" }],
    };

    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify([nextEntry, ...parsed]));

    toast.success(`Successfully applied to ${activeApplyJob.company}!`);
    setActiveApplyJob(null);
    setCoverLetter("");
  };

  const toggleBookmark = (jobId: string) => {
    setBookmarkedJobIds((current) =>
      current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId],
    );
  };

  const createAlertFromFilters = () => {
    const entry: JobAlert = {
      id: `alert-${Date.now()}`,
      name: `Alert ${alerts.length + 1}`,
      keywords: search || "Any",
      location: filters.location || "Any",
    };

    setAlerts((current) => [entry, ...current]);
    toast.success("Job alert created from your current search/filter set.");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Find Your Next Role</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {jobs.length} open positions · {filtered.length} matching your filters
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Smart matching uses skills, experience, remote preference, and urgency signals (0-100%).
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/applications"
            className="rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            My Applications
          </Link>
          <button
            type="button"
            onClick={createAlertFromFilters}
            className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
          >
            <BellRing className="h-3.5 w-3.5" />
            Create alert
          </button>
        </div>
      </div>

      {/* AI Recommendations Banner */}
      {filtered.length > 0 && sortBy === "match" && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/20 p-5 shadow-sm">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-500/20 p-2 text-blue-600 shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">AI Daily Match Recommendations</h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-lg">Based on your skills and search history, we've organized these opportunities specifically for you. Save searches or follow companies to improve your daily tailored results.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, company, or skill..."
          className="h-12 w-full rounded-2xl border border-border bg-card pl-11 pr-4 text-sm text-foreground shadow-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
        />
      </div>

      {/* Filters */}
      <JobFiltersPanel filters={filters} onChange={setFilters} />

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Sort by:</span>
        <button
          onClick={() => setSortBy("match")}
          className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${sortBy === "match" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
        >
          <TrendingUp className="h-3 w-3" />
          Best Match
        </button>
        <button
          onClick={() => setSortBy("recent")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${sortBy === "recent" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
        >
          Most Recent
        </button>

        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <BookmarkCheck className="h-3.5 w-3.5" />
          {bookmarkedJobIds.length} bookmarked
        </span>
      </div>

      {alerts.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <p className="text-sm font-semibold text-foreground">Active job alerts</p>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            {alerts.slice(0, 3).map((alert) => (
              <p key={alert.id}>• {alert.name} — {alert.keywords} in {alert.location}</p>
            ))}
          </div>
        </div>
      )}

      {/* Job List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApply={handleApplyClick}
              onBookmark={toggleBookmark}
              isBookmarked={bookmarkedJobIds.includes(job.id)}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-card">
            <p className="text-sm text-muted-foreground">No jobs match your criteria. Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {/* Application Modal Overlay */}
      <AnimatePresence>
        {activeApplyJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setActiveApplyJob(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border p-6 bg-secondary/30">
                <div className="flex items-center gap-3">
                  <img src={activeApplyJob.companyLogo} alt={activeApplyJob.company} className="h-10 w-10 rounded-xl object-cover ring-2 ring-primary/20" />
                  <div>
                    <h2 className="text-lg font-bold text-foreground leading-tight">{activeApplyJob.title}</h2>
                    <p className="text-sm font-medium text-muted-foreground">{activeApplyJob.company} • {activeApplyJob.location}</p>
                  </div>
                </div>
                <button onClick={() => setActiveApplyJob(null)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Resume
                  </h3>
                  <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{SAVED_RESUME_NAME}</p>
                        <p className="text-[10px] text-muted-foreground">Updated 2 days ago</p>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-primary hover:text-primary/80">Change</button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-foreground">Cover Letter <span className="text-muted-foreground font-normal">(Optional)</span></h3>
                    <button className="text-[10px] font-bold text-blue-500 hover:text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded flex items-center gap-1"><Sparkles className="h-3 w-3" /> Generate with AI</button>
                  </div>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full h-32 rounded-xl border border-border bg-secondary/50 p-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none placeholder:text-muted-foreground/60"
                    placeholder="Highlight your relevant experience and why you are a great fit..."
                  />
                </div>
              </div>

              <div className="border-t border-border p-6 bg-secondary/20 flex items-center justify-end gap-3">
                <button onClick={() => setActiveApplyJob(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                  Cancel
                </button>
                <button onClick={submitApplication} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-md hover:shadow-lg hover:opacity-90 transition-all flex items-center gap-2">
                  Submit Application <Upload className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
