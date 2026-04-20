import { Eye, TrendingUp, EyeOff } from "lucide-react";
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
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold font-display text-foreground">Who Viewed Your Profile</h2>
        </div>
        <button
          onClick={() => setAnonymousMode(!anonymousMode)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          title={anonymousMode ? "Anonymous mode ON" : "Anonymous mode OFF"}
        >
          {anonymousMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {anonymousMode ? "Anonymous" : "Visible"}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl bg-secondary p-3">
          <p className="text-2xl font-bold font-display text-foreground">{mockStats.totalViews}</p>
          <p className="text-xs text-muted-foreground">Profile views</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-accent" />
            <span className="text-xs font-medium text-accent">+{mockStats.weeklyChange}% this week</span>
          </div>
        </div>
        <div className="rounded-xl bg-secondary p-3">
          <p className="text-2xl font-bold font-display text-foreground">{mockStats.searchAppearances}</p>
          <p className="text-xs text-muted-foreground">Search appearances</p>
        </div>
      </div>

      {/* Recent viewers */}
      <div className="space-y-3">
        {mockViewers.map((viewer, i) => (
          <div key={i} className="flex items-center gap-3">
            <img
              src={viewer.user.avatar}
              alt={viewer.user.name}
              className="h-9 w-9 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{viewer.user.name}</p>
              <p className="text-xs text-muted-foreground">{viewer.user.title}</p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{viewer.viewedAt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
