import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { currentUser } from "@/data/mockData";

interface ProfileField {
  label: string;
  completed: boolean;
  weight: number;
}

function getProfileFields(): ProfileField[] {
  return [
    { label: "Profile photo", completed: !!currentUser.avatar, weight: 15 },
    { label: "Headline/title", completed: !!currentUser.title, weight: 10 },
    { label: "Company", completed: !!currentUser.company, weight: 10 },
    { label: "Skills (3+)", completed: (currentUser.skills?.length ?? 0) >= 3, weight: 20 },
    { label: "Experience", completed: (currentUser.experience ?? 0) > 0, weight: 15 },
    { label: "Education", completed: !!currentUser.education, weight: 10 },
    { label: "About section", completed: true, weight: 10 }, // mock: always filled
    { label: "Resume uploaded", completed: false, weight: 10 }, // mock: not uploaded yet
  ];
}

export default function ProfileStrengthScore() {
  const fields = getProfileFields();
  const score = fields.reduce((acc, f) => acc + (f.completed ? f.weight : 0), 0);

  const level = score >= 90 ? "All-Star" : score >= 70 ? "Advanced" : score >= 50 ? "Intermediate" : "Beginner";
  const color = score >= 90 ? "text-accent" : score >= 70 ? "text-primary" : score >= 50 ? "text-warning" : "text-destructive";

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Shield className={`h-5 w-5 ${color}`} />
        <h2 className="text-lg font-semibold font-display text-foreground">Profile Strength</h2>
      </div>

      <div className="flex items-end gap-3 mb-2">
        <span className={`text-3xl font-bold font-display ${color}`}>{score}%</span>
        <span className={`text-sm font-medium ${color} mb-1`}>{level}</span>
      </div>

      <Progress value={score} className="h-2.5 mb-5" />

      <div className="space-y-2.5">
        {fields.map((field) => (
          <div key={field.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {field.completed ? (
                <CheckCircle2 className="h-4 w-4 text-accent" />
              ) : (
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={field.completed ? "text-foreground" : "text-muted-foreground"}>
                {field.label}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">+{field.weight}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
