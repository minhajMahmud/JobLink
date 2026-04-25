import { Sparkles, MapPin, Briefcase, ArrowRight, Zap } from "lucide-react";
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
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-amber-500 to-orange-500 opacity-5 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-600/10 to-orange-600/10">
            <Sparkles className="h-5 w-5 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold font-display text-foreground">Recommended For You</h2>
        </div>

        <div className="space-y-3 mb-4">
          {recommended.map((job) => (
            <div key={job.id} className="flex gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-all group cursor-pointer border border-border/0 hover:border-border">
              <div className="relative shrink-0">
                <img src={job.companyLogo} alt={job.company} className="h-12 w-12 rounded-xl object-cover" />
                <div className="absolute -bottom-1 -right-1">
                  <JobMatchBadge score={job.matchScore} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-blue-600 transition-colors truncate">
                  {job.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{job.company}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/jobs")}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-amber-600/30 transition-all"
        >
          <Zap className="h-4 w-4" />
          Explore All Opportunities
        </button>
      </div>
    </div>
  );
}
