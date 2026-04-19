import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const SUGGESTED_SKILLS = [
  "React", "TypeScript", "Node.js", "Python", "GraphQL", "AWS", "Docker",
  "CI/CD", "System Design", "Figma", "SQL", "Kubernetes", "REST APIs",
  "Machine Learning", "Agile", "Java", "Go", "CSS", "Git", "MongoDB",
];

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
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold font-display text-foreground">Skills</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm font-medium text-primary hover:underline"
        >
          {isEditing ? "Done" : "Edit"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map((skill) => (
          <Badge
            key={skill}
            variant="secondary"
            className="bg-brand-light text-primary px-3 py-1.5 text-sm font-medium rounded-xl gap-1.5"
          >
            {skill}
            {isEditing && (
              <button onClick={() => removeSkill(skill)} className="hover:text-destructive transition-colors">
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>

      {isEditing && (
        <div className="space-y-3">
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a skill and press Enter..."
              className="rounded-xl"
            />
          </div>

          {input && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => addSkill(s)}
                  className="flex items-center gap-1 rounded-xl border border-dashed border-primary/40 px-3 py-1.5 text-sm text-primary hover:bg-brand-light transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
