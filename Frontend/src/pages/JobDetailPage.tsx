import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, DollarSign, Clock, Users, Briefcase, CheckCircle2, AlertCircle } from "lucide-react";
import { Job } from "@/data/mockData";
import JobMatchBadge from "@/components/jobs/JobMatchBadge";
import { toast } from "sonner";
import * as candidateApi from "@/features/profile/api/candidateApi";

export default function JobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetail = async () => {
      if (!jobId) {
        setError("Job not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await candidateApi.getJobDetail(jobId);
        setJob(response);
      } catch (err) {
        console.error("Failed to fetch job details:", err);
        setError("Failed to load job details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [jobId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-card">
          <p className="text-sm text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-12 text-center shadow-card">
          <p className="text-sm text-destructive">{error || "Job not found"}</p>
        </div>
      </div>
    );
  }

  const handleApply = () => {
    navigate("/jobs", { state: { applyToJob: job } });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-start gap-4">
          <img src={job.companyLogo} alt={job.company} className="h-16 w-16 rounded-xl object-cover ring-2 ring-primary/20" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold font-display text-foreground">{job.title}</h1>
                <p className="text-lg font-semibold text-muted-foreground mt-1">{job.company}</p>
                <p className="text-sm text-muted-foreground mt-2">{job.location}</p>
              </div>
              <button
                onClick={handleApply}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all shadow-md whitespace-nowrap"
              >
                Apply Now
              </button>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3">
                <DollarSign className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Salary</p>
                  <p className="text-sm font-semibold text-foreground">{job.salary}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3">
                <Briefcase className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-semibold text-foreground">{job.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Posted</p>
                  <p className="text-sm font-semibold text-foreground">{job.postedAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3">
                <Users className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Applicants</p>
                  <p className="text-sm font-semibold text-foreground">{job.applicants}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">{job.remotePolicy}</span>
          <span className="rounded-lg bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">{job.experienceLevel}</span>
          <span className="rounded-lg bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">{job.industry}</span>
          <span className="rounded-lg bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">{job.companySize}</span>
          {job.visaSupport && <span className="rounded-lg bg-accent/10 px-3 py-1 text-sm font-medium text-accent">Visa support</span>}
          {job.urgentHiring && <span className="rounded-lg bg-warning/10 px-3 py-1 text-sm font-medium text-warning">Urgent hiring</span>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-bold text-foreground mb-3">About the Role</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          {/* Requirements */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-bold text-foreground mb-3">Requirements</h2>
            <ul className="space-y-2">
              {job.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-bold text-foreground mb-3">Benefits</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {job.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-sm font-bold text-foreground mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Company Info */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-sm font-bold text-foreground mb-3">Company</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Company Size</p>
                <p className="text-sm font-semibold text-foreground">{job.companySize}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Industry</p>
                <p className="text-sm font-semibold text-foreground">{job.industry}</p>
              </div>
              <button className="w-full mt-3 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                View Company Profile
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleApply}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all shadow-md"
          >
            Apply to {job.company}
          </button>
        </div>
      </div>
    </div>
  );
}
