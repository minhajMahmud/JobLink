import { useState } from "react";
import { X, Plus, Sparkles, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const SUGGESTED_SKILLS = [
  "React", "TypeScript", "Node.js", "Python", "GraphQL", "AWS", "Docker",
  "CI/CD", "System Design", "Figma", "SQL", "Kubernetes", "REST APIs",
  "Machine Learning", "Agile", "Java", "Go", "CSS", "Git", "MongoDB",
];

const SKILL_CATEGORIES = {
  "Frontend": ["React", "TypeScript", "CSS", "Figma"],
  "Backend": ["Node.js", "Python", "Java", "Go", "SQL", "MongoDB"],
  "DevOps": ["Docker", "Kubernetes", "CI/CD", "AWS"],
  "Other": ["System Design", "GraphQL", "REST APIs", "Machine Learning", "Git", "Agile"]
};

interface SkillTaggerProps {
  initialSkills?: string[];
  onSkillsChange?: (skills: string[]) => void;
}

export default function SkillTagger({ initialSkills = [], onSkillsChange }: SkillTaggerProps) {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [input, setInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const suggestions = SUGGESTED_SKILLS.filter(
    (s) => !skills.some((sk) => sk.toLowerCase() === s.toLowerCase()) && s.toLowerCase().includes(input.toLowerCase())
  ).slice(0, 5);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
    const updated = [...skills, trimmed];
    setSkills(updated);
    onSkillsChange?.(updated);
    setInput("");
  };

  const removeSkill = (skill: string) => {
    const updated = skills.filter((s) => s !== skill);
    setSkills(updated);
    onSkillsChange?.(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(input);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-blue-500 to-purple-500 opacity-5 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600/10 to-purple-600/10">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold font-display text-foreground">Skills</h2>
            {skills.length > 0 && (
              <span className="px-2 py-1 text-xs font-semibold bg-blue-500/20 text-blue-700 rounded-lg">{skills.length} skills</span>
            )}
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors px-3 py-1 rounded-lg hover:bg-blue-500/10"
          >
            {isEditing ? "Done" : "Edit"}
          </button>
        </div>

        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill) => (
              <div
                key={skill}
                className="group flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
              >
                <span className="text-sm font-semibold text-blue-700">{skill}</span>
                <TrendingUp className="h-3 w-3 text-blue-600 opacity-60" />
                {isEditing && (
                  <button
                    type="button"
                    aria-label={`Remove ${skill}`}
                    title={`Remove ${skill}`}
                    onClick={() => removeSkill(skill)}
                    className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-4 p-4 rounded-xl bg-secondary/30 border border-border/50 text-center">
            <p className="text-sm text-muted-foreground">Add skills to showcase your expertise</p>
          </div>
        )}

        {isEditing && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a skill and press Enter..."
                className="rounded-xl border-blue-200/50 focus:border-blue-500"
              />
              <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>

            {input && suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => addSkill(s)}
                      className="flex items-center gap-1 rounded-xl border border-dashed border-blue-400/50 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-500/5 hover:bg-blue-500/15 hover:border-blue-500 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!input && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground">Popular Skills</p>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_SKILLS.slice(0, 8).map((s) => (
                    <button
                      key={s}
                      onClick={() => addSkill(s)}
                      className="flex items-center justify-center gap-1 rounded-lg border border-border/50 px-2 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                    >
                      <Plus className="h-3 w-3" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
