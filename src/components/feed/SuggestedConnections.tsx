import { UserPlus } from "lucide-react";
import { users } from "@/data/mockData";

export default function SuggestedConnections() {
  const suggestions = users.slice(1, 4);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <h3 className="mb-3 text-sm font-semibold font-display text-foreground">People you may know</h3>
      <div className="space-y-3">
        {suggestions.map((user) => (
          <div key={user.id} className="flex items-center gap-3">
            <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.title}</p>
            </div>
            <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary text-primary hover:bg-brand-light transition-colors">
              <UserPlus className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
