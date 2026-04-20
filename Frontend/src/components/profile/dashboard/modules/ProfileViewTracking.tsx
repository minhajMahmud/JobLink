import React, { useMemo } from "react";
import { Eye, TrendingUp, Users } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ProfileMetrics } from "@/data/dashboard/mockData";
import { MOCK_PROFILE_METRICS } from "@/data/dashboard/mockData";
import { formatNumber, getGrowthTrend } from "@/data/dashboard/dashboardUtils";

interface ProfileViewTrackingProps {
  metrics?: ProfileMetrics;
  loading?: boolean;
}

export const ProfileViewTracking: React.FC<ProfileViewTrackingProps> = ({
  metrics = MOCK_PROFILE_METRICS,
  loading = false,
}) => {
  const growthTrend = useMemo(() => getGrowthTrend(metrics.weeklyGrowth), [
    metrics.weeklyGrowth,
  ]);

  const maxViews = useMemo(
    () => Math.max(...metrics.viewTrend.map((d) => d.views)) || 30,
    [metrics.viewTrend],
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Profile Views</h3>
        <p className="text-sm text-slate-500">Track who's viewing your profile</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
        {/* Total Views */}
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4">
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-blue-200" />
              <div className="h-6 w-1/2 animate-pulse rounded bg-blue-200" />
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-blue-700">Total Views</p>
              <p className="mt-1 text-2xl font-bold text-blue-900">
                {formatNumber(metrics.totalViews)}
              </p>
            </>
          )}
        </div>

        {/* Weekly Growth */}
        <div className={`rounded-lg bg-gradient-to-br p-4 ${growthTrend.color.includes("emerald") ? "from-emerald-50 to-emerald-100" : growthTrend.color.includes("red") ? "from-red-50 to-red-100" : "from-slate-50 to-slate-100"}`}>
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200" />
            </div>
          ) : (
            <>
              <p className={`text-xs font-medium ${growthTrend.color}`}>
                Weekly Change
              </p>
              <p className={`mt-1 text-2xl font-bold ${growthTrend.color}`}>
                {growthTrend.text}
              </p>
            </>
          )}
        </div>

        {/* Recruiter Views */}
        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4">
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-purple-200" />
              <div className="h-6 w-1/2 animate-pulse rounded bg-purple-200" />
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-purple-700">Recruiter Views</p>
              <p className="mt-1 text-2xl font-bold text-purple-900">
                {formatNumber(metrics.recruiterViews)}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
        {loading ? (
          <div className="h-64 animate-pulse rounded bg-slate-200" />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metrics.viewTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
                domain={[0, Math.ceil(maxViews * 1.1)]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
                cursor={{ stroke: "#3b82f6", strokeWidth: 2 }}
              />

              <Line
                type="monotone"
                dataKey="views"
                stroke="#3b82f6"
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorViews)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Insights */}
      <div className="rounded-lg bg-slate-50 p-4">
        <h4 className="mb-3 font-medium text-slate-900">Insights</h4>

        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
          </div>
        ) : (
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>
                <strong>{metrics.totalViews}</strong> people have viewed your profile
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
              <span>
                <strong>{metrics.recruiterViews}</strong> views are from recruiters
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Eye className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
              <span>
                Your profile is <strong>more visible</strong> than {metrics.weeklyGrowth}% of
                users
              </span>
            </li>
          </ul>
        )}
      </div>

      {/* Footer CTA */}
      <button className="mt-4 w-full rounded-lg border border-slate-300 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
        View Detailed Analytics
      </button>
    </div>
  );
};

export default ProfileViewTracking;
