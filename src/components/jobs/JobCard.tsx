import { MapPin, Clock, Users, DollarSign, Bookmark } from "lucide-react";
import { Job, currentUser, calculateMatchScore } from "@/data/mockData";
import { motion } from "framer-motion";
import JobMatchBadge from "./JobMatchBadge";

interface JobCardProps {
  job: Job;
  onApply: (jobId: string) => void;
}

export default function JobCard({ job, onApply }: JobCardProps) {
  const matchScore = calculateMatchScore(currentUser.skills || [], job.skills);

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
              <p className="text-sm text-muted-foreground">{job.company}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {matchScore > 0 && <JobMatchBadge score={matchScore} />}
              <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <Bookmark className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
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

          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
              job.type === 'Remote'
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
                className={`rounded-lg px-2.5 py-1 text-xs ${
                  (currentUser.skills || []).map(s => s.toLowerCase()).includes(skill.toLowerCase())
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
              className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all"
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
