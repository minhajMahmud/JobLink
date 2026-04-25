import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle2, AlertCircle, Zap } from "lucide-react";
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
  const bgGradient = score >= 90 ? "from-amber-500 to-orange-500" : score >= 70 ? "from-blue-500 to-purple-500" : score >= 50 ? "from-cyan-500 to-blue-500" : "from-gray-500 to-slate-500";
  const textColor = score >= 90 ? "text-amber-600" : score >= 70 ? "text-blue-600" : score >= 50 ? "text-cyan-600" : "text-gray-600";

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow overflow-hidden relative">
      {/* Background gradient */}
      <div className={`absolute top-0 right-0 h-32 w-32 bg-gradient-to-br ${bgGradient} opacity-5 rounded-full blur-2xl`} />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${bgGradient} bg-opacity-10`}>
            <Shield className={`h-5 w-5 ${textColor}`} />
          </div>
          <h2 className="text-lg font-semibold font-display text-foreground">Profile Strength</h2>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className={`text-4xl font-bold font-display bg-gradient-to-r ${bgGradient} bg-clip-text text-transparent`}>{score}%</div>
          <div className="flex flex-col">
            <span className={`text-sm font-semibold ${textColor}`}>{level}</span>
            <span className="text-xs text-muted-foreground">Keep growing</span>
          </div>
        </div>

        <div className="mb-5 overflow-hidden rounded-full bg-secondary/50">
          <Progress value={score} className="h-3" />
        </div>

        <div className="space-y-2.5">
          {fields.map((field) => (
            <div key={field.label} className="flex items-center justify-between text-sm group hover:bg-secondary/30 px-2 py-1 rounded transition-colors">
              <div className="flex items-center gap-2">
                {field.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className={field.completed ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {field.label}
                </span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">+{field.weight}%</span>
            </div>
          ))}
        </div>

        {score < 100 && (
          <div className="mt-4 pt-4 border-t border-border">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-blue-600/30 transition-all">
              <Zap className="h-4 w-4" />
              Complete Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
