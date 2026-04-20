import { TrendingUp } from "lucide-react";

const topics = [
  { tag: "#TechHiring", posts: "2.4k posts" },
  { tag: "#RemoteWork", posts: "1.8k posts" },
  { tag: "#AIEngineering", posts: "3.1k posts" },
  { tag: "#StartupLife", posts: "982 posts" },
];

export default function TrendingTopics() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold font-display text-foreground">Trending</h3>
      </div>
      <div className="space-y-2.5">
        {topics.map((topic) => (
          <button key={topic.tag} className="block w-full text-left rounded-lg px-2 py-1.5 hover:bg-secondary transition-colors">
            <p className="text-sm font-medium text-primary">{topic.tag}</p>
            <p className="text-xs text-muted-foreground">{topic.posts}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
