import { Sparkles } from "lucide-react";

interface JobMatchBadgeProps {
  score: number;
}

export default function JobMatchBadge({ score }: JobMatchBadgeProps) {
  const color =
    score >= 75
      ? "text-accent bg-accent/10 border-accent/20"
      : score >= 50
      ? "text-primary bg-primary/10 border-primary/20"
      : score >= 25
      ? "text-warning bg-warning/10 border-warning/20"
      : "text-muted-foreground bg-secondary border-border";

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${color}`}>
      <Sparkles className="h-3 w-3" />
      {score}% match
    </div>
  );
}
