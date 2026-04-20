import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Calendar,
  Zap,
  TrendingUp,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { Interview, JobPromotion, CompanyPost } from "@/modules/recruiter/types";

interface DashboardStats {
  total_candidates: number;
  saved_searches: number;
  scheduled_interviews: number;
  active_promotions: number;
  total_posts: number;
  engagement_rate: number;
}

interface DashboardData {
  stats: DashboardStats;
  upcoming_interviews: Interview[];
  active_promotions: JobPromotion[];
  recent_posts: CompanyPost[];
  daily_analytics: Array<{
    date: string;
    views: number;
    applications: number;
    engagements: number;
  }>;
}

export const RecruiterDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data - replace with actual API call
      setData({
        stats: {
          total_candidates: 1247,
          saved_searches: 8,
          scheduled_interviews: 12,
          active_promotions: 3,
          total_posts: 24,
          engagement_rate: 4.2,
        },
        upcoming_interviews: [
          {
            id: "int-1",
            candidate_id: "cand-1",
            job_id: "job-1",
            recruiter_id: "rec-1",
            type: "Virtual",
            round: "Screening",
            status: "Scheduled",
            scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            duration_minutes: 30,
            timezone: "UTC",
            agenda: "Initial screening call",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        active_promotions: [
          {
            id: "promo-1",
            job_id: "job-1",
            recruiter_id: "rec-1",
            company_id: "comp-1",
            duration_days: 15,
            is_active: true,
            views: 1234,
            clicks: 56,
            applications: 12,
            status: "Active",
            payment_status: "Completed",
            amount_paid: 49.99,
          },
        ],
        recent_posts: [],
        daily_analytics: [
          { date: "Mon", views: 200, applications: 12, engagements: 45 },
          { date: "Tue", views: 220, applications: 15, engagements: 52 },
          { date: "Wed", views: 190, applications: 10, engagements: 38 },
          { date: "Thu", views: 250, applications: 18, engagements: 61 },
          { date: "Fri", views: 280, applications: 22, engagements: 75 },
          { date: "Sat", views: 150, applications: 8, engagements: 28 },
          { date: "Sun", views: 170, applications: 9, engagements: 32 },
        ],
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">
          <Clock className="h-12 w-12 text-blue-600" />
        </div>
      </div>
    );
  }

  if (!data) {
    return <div>Failed to load dashboard</div>;
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Recruiter Dashboard</h1>
          <p className="text-slate-600 mt-2">Welcome back! Here's your hiring overview.</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Candidates */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Candidates</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {data.stats.total_candidates.toLocaleString()}
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-100" />
            </div>
          </div>

          {/* Scheduled Interviews */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Scheduled Interviews</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {data.stats.scheduled_interviews}
                </p>
              </div>
              <Calendar className="h-12 w-12 text-green-100" />
            </div>
          </div>

          {/* Active Promotions */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Active Promotions</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {data.stats.active_promotions}
                </p>
              </div>
              <Zap className="h-12 w-12 text-purple-100" />
            </div>
          </div>

          {/* Engagement Rate */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Engagement Rate</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{data.stats.engagement_rate}%</p>
              </div>
              <TrendingUp className="h-12 w-12 text-orange-100" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Daily Analytics Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Weekly Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.daily_analytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#3B82F6" name="Job Views" />
                  <Bar dataKey="applications" fill="#10B981" name="Applications" />
                  <Bar dataKey="engagements" fill="#F59E0B" name="Engagements" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Application Pipeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Application Pipeline</h3>
              <div className="space-y-4">
                {[
                  { stage: "New Applications", count: 45, color: "bg-blue-500" },
                  { stage: "Screening", count: 28, color: "bg-purple-500" },
                  { stage: "Interview Scheduled", count: 12, color: "bg-green-500" },
                  { stage: "Offer Pending", count: 5, color: "bg-orange-500" },
                ].map((stage) => (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{stage.stage}</span>
                      <span className="text-sm font-bold text-slate-900">{stage.count}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${stage.color}`}
                        style={{ width: `${(stage.count / 45) * 100}%` }}
                         title={`${stage.stage}: ${stage.count} candidates`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Interviews */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Interviews
              </h3>
              <div className="space-y-3">
                {data.upcoming_interviews.length > 0 ? (
                  data.upcoming_interviews.map((interview) => (
                    <div key={interview.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-medium text-sm text-slate-900">
                        {interview.round} Round - {interview.type}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {new Date(interview.scheduled_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600 text-sm">No upcoming interviews</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                  Search Candidates
                </button>
                <button className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-medium hover:bg-slate-50">
                  Schedule Interview
                </button>
                <button className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-medium hover:bg-slate-50">
                  Promote Job
                </button>
                <button className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-medium hover:bg-slate-50">
                  Create Post
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700">
                    Interview completed with <span className="font-medium">Sarah Johnson</span>
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700">
                    Job promotion for <span className="font-medium">Senior Developer</span> expires in 2 days
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700">
                    New comment on company post
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
