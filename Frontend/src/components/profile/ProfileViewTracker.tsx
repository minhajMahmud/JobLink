import { Eye, TrendingUp, EyeOff, Zap } from "lucide-react";
import { useState } from "react";
import { users } from "@/data/mockData";

const mockViewers = [
  { user: users[1], viewedAt: "2 hours ago" },
  { user: users[2], viewedAt: "5 hours ago" },
  { user: users[3], viewedAt: "1 day ago" },
  { user: users[4], viewedAt: "2 days ago" },
];

const mockStats = {
  totalViews: 127,
  weeklyChange: 23,
  searchAppearances: 45,
};

export default function ProfileViewTracker() {
  const [anonymousMode, setAnonymousMode] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-cyan-500 to-blue-500 opacity-5 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-600/10 to-blue-600/10">
              <Eye className="h-5 w-5 text-cyan-600" />
            </div>
            <h2 className="text-lg font-semibold font-display text-foreground">Who Viewed Your Profile</h2>
          </div>
          <button
            onClick={() => setAnonymousMode(!anonymousMode)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all"
            title={anonymousMode ? "Anonymous mode ON" : "Anonymous mode OFF"}
          >
            {anonymousMode ? (
              <>
                <EyeOff className="h-3.5 w-3.5 text-orange-600" />
                <span className="text-orange-600">Anonymous</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 text-cyan-600" />
                <span className="text-cyan-600">Visible</span>
              </>
            )}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl bg-gradient-to-br from-cyan-600/10 to-blue-600/10 border border-cyan-500/20 p-4 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold font-display text-foreground">{mockStats.totalViews}</p>
              <span className="text-xs font-semibold text-cyan-600 bg-cyan-500/20 px-2 py-1 rounded-lg">+{mockStats.weeklyChange}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Profile views this week</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 p-4 hover:border-blue-500/40 transition-colors">
            <p className="text-3xl font-bold font-display text-foreground">{mockStats.searchAppearances}</p>
            <p className="text-xs text-muted-foreground mt-2">Search appearances</p>
          </div>
        </div>

        {/* Recent viewers */}
        <div className="space-y-3 mb-4">
          <p className="text-xs font-semibold text-muted-foreground">Recent Viewers</p>
          {mockViewers.map((viewer, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group">
              <img
                src={viewer.user.avatar}
                alt={viewer.user.name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-border group-hover:ring-cyan-500/50 transition-all"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{viewer.user.name}</p>
                <p className="text-xs text-muted-foreground">{viewer.user.title}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{viewer.viewedAt}</span>
            </div>
          ))}
        </div>

        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-cyan-600/30 transition-all">
          <Zap className="h-4 w-4" />
          View All Viewers
        </button>
      </div>
    </div>
  );
}
