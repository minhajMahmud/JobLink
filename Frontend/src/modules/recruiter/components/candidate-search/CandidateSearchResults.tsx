import React, { useState, useEffect } from "react";
import { Loader, Star, MapPin, Briefcase, TrendingUp, MessageCircle } from "lucide-react";
import type { Candidate } from "@/modules/recruiter/types";

interface CandidateSearchResultsProps {
  candidates: Candidate[];
  loading?: boolean;
  total: number;
  page: number;
  limit: number;
  onPaginate?: (page: number) => void;
  onSelectCandidate?: (candidate: Candidate) => void;
}

export const CandidateSearchResults: React.FC<CandidateSearchResultsProps> = ({
  candidates,
  loading = false,
  total,
  page,
  limit,
  onPaginate,
  onSelectCandidate,
}) => {
  const totalPages = Math.ceil(total / limit);

  const handleQuickContact = (e: React.MouseEvent, candidateId: string) => {
    e.stopPropagation();
    console.log("Contact candidate:", candidateId);
    // Would open messaging/contact modal
  };

  const handleScheduleInterview = (e: React.MouseEvent, candidateId: string) => {
    e.stopPropagation();
    console.log("Schedule interview:", candidateId);
    // Would open interview scheduling modal
  };

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between rounded-lg bg-white border border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900">Search Results</h3>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            {total} candidate{total !== 1 ? "s" : ""}
          </span>
        </div>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          defaultValue="relevance"
          aria-label="Sort candidates"
        >
          <option value="relevance">Sort: Relevance</option>
          <option value="recent">Sort: Recently Active</option>
          <option value="experience">Sort: Experience</option>
        </select>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-lg bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 bg-slate-200 rounded" />
                  <div className="h-3 w-1/3 bg-slate-200 rounded" />
                  <div className="h-3 w-1/2 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : candidates.length > 0 ? (
        <div className="space-y-3">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => onSelectCandidate?.(candidate)}
              className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
            >
              <div className="flex gap-4 items-start">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src={candidate.avatar_url || "https://via.placeholder.com/64"}
                    alt={candidate.user_id}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Name & Title */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-lg">
                        Candidate #{candidate.id.slice(0, 8)}
                      </h4>
                      <p className="text-sm text-slate-600 line-clamp-2">{candidate.bio}</p>
                    </div>

                    {/* Match Score */}
                    <div className="flex-shrink-0 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5">
                      <Star className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-emerald-700">95%</span>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {candidate.experience_years} yrs experience
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {candidate.location}
                    </span>
                    <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">
                      {candidate.availability_status}
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {candidate.skills.slice(0, 5).map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 5 && (
                      <span className="inline-block text-xs text-slate-600 font-medium px-2">
                        +{candidate.skills.length - 5} more
                      </span>
                    )}
                  </div>

                  {/* Salary Info */}
                  {candidate.salary_expectation_min && candidate.salary_expectation_max && (
                    <div className="mt-2 text-sm text-slate-600">
                      <TrendingUp className="inline h-4 w-4 mr-1" />
                      ${candidate.salary_expectation_min.toLocaleString()} - $
                      {candidate.salary_expectation_max.toLocaleString()} /year
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex flex-col gap-2">
                  <button
                    onClick={(e) => handleScheduleInterview(e, candidate.id)}
                    className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
                    title="Schedule interview"
                  >
                    Schedule
                  </button>
                  <button
                    onClick={(e) => handleQuickContact(e, candidate.id)}
                    className="rounded-lg border border-slate-300 text-slate-900 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                    title="Send message"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600 font-medium">No candidates found</p>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search filters</p>
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between rounded-lg bg-white border border-slate-200 p-4">
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages} • Showing {(page - 1) * limit + 1}-
            {Math.min(page * limit, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPaginate?.(page - 1)}
              disabled={page === 1}
              className="rounded-lg border border-slate-300 text-slate-900 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-500"
            >
              Previous
            </button>
            <button
              onClick={() => onPaginate?.(page + 1)}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-300 text-slate-900 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-500"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateSearchResults;
