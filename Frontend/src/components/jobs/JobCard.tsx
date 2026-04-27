import { useState } from "react";
import { MapPin, Clock, Users, DollarSign, Bookmark, Verified, UserPlus } from "lucide-react";
import { Job, currentUser, calculateSmartMatchScore } from "@/data/mockData";
import { motion } from "framer-motion";
import JobMatchBadge from "./JobMatchBadge";

interface JobCardProps {
  job: Job;
  onApply: (jobId: string) => void;
  onBookmark: (jobId: string) => void;
  isBookmarked: boolean;
}

export default function JobCard({ job, onApply, onBookmark, isBookmarked }: JobCardProps) {
  const matchScore = calculateSmartMatchScore(currentUser, job);
  const [following, setFollowing] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-all"
    >
      <div className="flex items-start gap-4">
        <img
          src={job.companyLogo}
          alt={job.company}
          className="h-12 w-12 shrink-0 rounded-xl object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold font-display text-foreground group-hover:text-primary transition-colors">
                {job.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm font-bold text-muted-foreground">{job.company}</p>
                <div className="flex items-center gap-1">
                  <Verified className="h-3.5 w-3.5 text-blue-500" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setFollowing(!following); }}
                    className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded transition-all ${following ? 'bg-secondary text-foreground' : 'text-primary bg-primary/10 hover:bg-primary/20'}`}
                  >
                    {!following && <UserPlus className="h-3 w-3" />}
                    {following ? "Following" : "Follow"}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {matchScore > 0 && <JobMatchBadge score={matchScore} />}
              <button
                type="button"
                onClick={() => onBookmark(job.id)}
                aria-label={`Save ${job.title}`}
                title={`Save ${job.title}`}
                className={`rounded-lg p-2 transition-colors ${isBookmarked ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </span>
            <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
              {job.remotePolicy}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              {job.salary}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {job.postedAt}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {job.applicants} applicants
            </span>
          </div>

          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{job.description}</p>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-lg bg-secondary px-2 py-1 text-[11px] font-medium text-secondary-foreground">{job.industry}</span>
            <span className="rounded-lg bg-secondary px-2 py-1 text-[11px] font-medium text-secondary-foreground">{job.companySize}</span>
            {job.visaSupport && <span className="rounded-lg bg-accent/10 px-2 py-1 text-[11px] font-medium text-accent">Visa support</span>}
            {job.urgentHiring && <span className="rounded-lg bg-warning/10 px-2 py-1 text-[11px] font-medium text-warning">Urgent hiring</span>}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${job.type === 'Remote'
                ? 'bg-accent/10 text-accent'
                : job.type === 'Full-time'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-warning/10 text-warning'
              }`}>
              {job.type}
            </span>
            <span className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
              {job.experienceLevel}
            </span>
            {job.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className={`rounded-lg px-2.5 py-1 text-xs ${(currentUser.skills || []).map(s => s.toLowerCase()).includes(skill.toLowerCase())
                    ? "bg-accent/10 text-accent font-semibold"
                    : "bg-secondary text-secondary-foreground"
                  }`}
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => onApply(job.id)}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all shadow-sm"
            >
              Apply Now
            </button>
            <button className="rounded-xl border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-all">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
