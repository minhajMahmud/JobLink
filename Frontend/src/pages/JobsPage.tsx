import { useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import { jobs, currentUser, calculateMatchScore } from "@/data/mockData";
import JobCard from "@/components/jobs/JobCard";
import JobFiltersPanel, { JobFilters } from "@/components/jobs/JobFilters";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<JobFilters>({
    type: "All",
    experienceLevel: "All",
    salaryRange: [0, 300],
    skills: [],
  });
  const [sortBy, setSortBy] = useState<"match" | "recent">("match");

  const filtered = jobs
    .filter((job) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q));
      const matchesType = filters.type === "All" || job.type === filters.type;
      const matchesExp = filters.experienceLevel === "All" || job.experienceLevel === filters.experienceLevel;
      const matchesSalary = job.salaryMax >= filters.salaryRange[0] && job.salaryMin <= filters.salaryRange[1];
      const matchesSkills =
        filters.skills.length === 0 ||
        filters.skills.some((s) => job.skills.map((js) => js.toLowerCase()).includes(s.toLowerCase()));
      return matchesSearch && matchesType && matchesExp && matchesSalary && matchesSkills;
    })
    .sort((a, b) => {
      if (sortBy === "match") {
        const scoreA = calculateMatchScore(currentUser.skills || [], a.skills);
        const scoreB = calculateMatchScore(currentUser.skills || [], b.skills);
        return scoreB - scoreA;
      }
      return 0; // keep original order for "recent"
    });

  const handleApply = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    toast.success(`Application submitted for ${job?.title}!`);
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
        </div>
        <Link
          to="/applications"
          className="shrink-0 rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          My Applications
        </Link>
      </div>

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
          className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            sortBy === "match" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          <TrendingUp className="h-3 w-3" />
          Best Match
        </button>
        <button
          onClick={() => setSortBy("recent")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            sortBy === "recent" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          Most Recent
        </button>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((job) => <JobCard key={job.id} job={job} onApply={handleApply} />)
        ) : (
          <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-card">
            <p className="text-sm text-muted-foreground">No jobs match your criteria. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
