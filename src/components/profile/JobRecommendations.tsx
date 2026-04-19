import { Sparkles, MapPin, Briefcase, ArrowRight } from "lucide-react";
import { jobs, currentUser, calculateMatchScore } from "@/data/mockData";
import JobMatchBadge from "@/components/jobs/JobMatchBadge";
import { useNavigate } from "react-router-dom";

export default function JobRecommendations() {
  const navigate = useNavigate();
  const userSkills = currentUser.skills ?? [];

  const recommended = jobs
    .map((job) => ({
      ...job,
      matchScore: calculateMatchScore(userSkills, job.skills),
    }))
    .filter((j) => j.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 4);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-warning" />
        <h2 className="text-lg font-semibold font-display text-foreground">Recommended For You</h2>
      </div>

      <div className="space-y-4">
        {recommended.map((job) => (
          <div key={job.id} className="flex gap-3 group">
            <img src={job.companyLogo} alt={job.company} className="h-10 w-10 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {job.title}
                </h3>
                <JobMatchBadge score={job.matchScore} />
              </div>
              <p className="text-xs text-muted-foreground">{job.company}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/jobs")}
        className="flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:underline"
      >
        View all jobs <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
