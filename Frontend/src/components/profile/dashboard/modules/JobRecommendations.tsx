import React, { useState } from "react";
import { Bookmark, BookmarkCheck, MapPin, Zap, Share2 } from "lucide-react";
import type { Job } from "@/data/dashboard/mockData";
import { MOCK_JOB_RECOMMENDATIONS } from "@/data/dashboard/mockData";
import {
  getMatchColor,
  getMatchBgColor,
  formatNumber,
} from "@/data/dashboard/dashboardUtils";

interface JobRecommendationsProps {
  jobs?: Job[];
  loading?: boolean;
  onApply?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
}

export const JobRecommendations: React.FC<JobRecommendationsProps> = ({
  jobs = MOCK_JOB_RECOMMENDATIONS,
  loading = false,
  onApply,
  onSave,
}) => {
  const [savedJobs, setSavedJobs] = useState<Set<string>>(
    new Set(jobs.filter((j) => j.saved).map((j) => j.id)),
  );

  const handleSave = (jobId: string) => {
    const newSaved = new Set(savedJobs);
    if (newSaved.has(jobId)) {
      newSaved.delete(jobId);
    } else {
      newSaved.add(jobId);
    }
    setSavedJobs(newSaved);
    onSave?.(jobId);
  };

  const handleApply = (jobId: string) => {
    onApply?.(jobId);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Job Recommendations</h3>
        <p className="text-sm text-slate-500">Personalized job matches based on your profile</p>
      </div>

      {/* Jobs Container */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {loading ? (
          // Skeleton Loaders
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-4 space-y-3">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                <div className="flex gap-2">
                  <div className="h-3 w-1/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-1/4 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="h-8 w-1/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-8 w-1/3 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length > 0 ? (
          jobs.map((job) => {
            const isSaved = savedJobs.has(job.id);
            return (
              <div
                key={job.id}
                className={`group rounded-lg border-2 p-4 transition-all ${
                  isSaved
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {/* Header with Logo */}
                <div className="mb-3 flex items-start gap-3">
                  {job.logo && (
                    <img
                      src={job.logo}
                      alt={job.company}
                      className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                    />
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-slate-900 leading-tight">
                          {job.title}
                        </h4>
                        <p className="text-sm text-slate-600">{job.company}</p>
                      </div>

                      {/* Match Badge */}
                      <div
                        className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${getMatchBgColor(job.matchPercentage)} ${getMatchColor(job.matchPercentage)}`}
                      >
                        <Zap className="h-3 w-3" />
                        {job.matchPercentage}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta Information */}
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{job.location}</span>
                  </div>
                  {job.salary && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-slate-900">{job.salary}</span>
                    </>
                  )}
                  {job.level && (
                    <>
                      <span>•</span>
                      <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5">
                        {job.level}
                      </span>
                    </>
                  )}
                </div>

                {/* Description Preview */}
                <p className="mb-4 text-sm text-slate-700 line-clamp-2">
                  {job.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleApply(job.id)}
                    className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    aria-label={`Apply for ${job.title}`}
                  >
                    Apply Now
                  </button>

                  <button
                    onClick={() => handleSave(job.id)}
                    className={`rounded-lg px-3 py-2 transition-colors ${
                      isSaved
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                    aria-label={isSaved ? `Unsave ${job.title}` : `Save ${job.title}`}
                    title={isSaved ? "Saved" : "Save for later"}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-4 w-4" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 transition-colors hover:bg-slate-50"
                    aria-label={`Share ${job.title}`}
                    title="Share job"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          // Empty State
          <div className="rounded-lg bg-slate-50 p-8 text-center">
            <Zap className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">No job matches found</p>
            <p className="text-xs text-slate-500 mt-1">
              Complete your profile to see personalized recommendations
            </p>
          </div>
        )}
      </div>

      {/* View All Button */}
      {!loading && jobs.length > 0 && (
        <button className="mt-4 w-full rounded-lg border border-slate-300 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
          View All Recommendations ({formatNumber(jobs.length)})
        </button>
      )}
    </div>
  );
};

export default JobRecommendations;
