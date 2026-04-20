import React, { useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import type { ProfileStrengthItem } from "@/data/dashboard/mockData";
import {
  calculateProfileStrength,
  getMissingProfileSections,
} from "@/data/dashboard/dashboardUtils";

interface ProfileStrengthScoreProps {
  items: ProfileStrengthItem[];
  loading?: boolean;
}

export const ProfileStrengthScore: React.FC<ProfileStrengthScoreProps> = ({
  items,
  loading = false,
}) => {
  const strength = useMemo(() => calculateProfileStrength(items), [items]);
  const missingItems = useMemo(() => getMissingProfileSections(items), [items]);

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (strength / 100) * circumference;

  const getStrengthColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  const getStrengthBgColor = (score: number) => {
    if (score >= 80) return "from-emerald-50 to-emerald-100";
    if (score >= 60) return "from-blue-50 to-blue-100";
    if (score >= 40) return "from-amber-50 to-amber-100";
    return "from-red-50 to-red-100";
  };

  const getStrengthLabel = (score: number) => {
    if (score >= 80) return "Strong";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Incomplete";
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Profile Strength</h3>
        <p className="text-sm text-slate-500">Complete your profile to attract more opportunities</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Circular Progress */}
        <div className="flex flex-col items-center justify-center">
          {loading ? (
            <div className="h-32 w-32 animate-pulse rounded-full bg-slate-200" />
          ) : (
            <div className="relative h-32 w-32">
              <svg
                className="h-32 w-32 -rotate-90 transform"
                viewBox="0 0 100 100"
              >
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />

                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className={`transition-all duration-500 ${getStrengthColor(strength)}`}
                />
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getStrengthColor(strength)}`}>
                  {strength}%
                </span>
                <span className="text-xs font-medium text-slate-600">
                  {getStrengthLabel(strength)}
                </span>
              </div>
            </div>
          )}

          <div className={`mt-4 w-full rounded-lg bg-gradient-to-r ${getStrengthBgColor(strength)} p-3 text-center`}>
            <p className="text-sm font-semibold text-slate-900">
              {strength === 100
                ? "Profile Complete! 🎉"
                : `${100 - strength}% to complete`}
            </p>
          </div>
        </div>

        {/* Missing Items */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900">Profile Checklist</h4>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-200" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-lg p-3 transition-all ${
                    item.completed
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-slate-50 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                  ) : (
                    <Circle className="h-5 w-5 flex-shrink-0 text-slate-400" />
                  )}

                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        item.completed ? "text-emerald-900" : "text-slate-700"
                      }`}
                    >
                      {item.label}
                    </p>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.completed ? "w-full bg-emerald-600" : "w-0 bg-slate-300"
                        }`}
                      />
                    </div>
                  </div>

                  <span className="text-xs font-medium text-slate-500">
                    {item.weight}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* CTA Button */}
          {strength < 100 && (
            <button
              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300"
              disabled={loading}
            >
              Complete Missing Sections
            </button>
          )}

          {strength === 100 && (
            <div className="mt-4 flex items-center justify-center rounded-lg bg-emerald-50 p-3 text-center">
              <p className="text-sm font-medium text-emerald-700">
                Your profile is all set! ✓
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileStrengthScore;
