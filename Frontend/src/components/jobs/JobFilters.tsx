import { useState } from "react";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface JobFilters {
  type: string;
  experienceLevel: string;
  salaryRange: [number, number];
  skills: string[];
}

const typeOptions = ["All", "Full-time", "Part-time", "Remote", "Contract"];
const experienceOptions = ["All", "Entry", "Mid", "Senior", "Lead"];
const skillOptions = ["React", "TypeScript", "Python", "SQL", "AWS", "Node.js", "Figma", "Kubernetes", "System design", "Team leadership"];

interface JobFiltersProps {
  filters: JobFilters;
  onChange: (filters: JobFilters) => void;
}

export default function JobFiltersPanel({ filters, onChange }: JobFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const activeCount = [
    filters.type !== "All" ? 1 : 0,
    filters.experienceLevel !== "All" ? 1 : 0,
    filters.salaryRange[0] > 0 || filters.salaryRange[1] < 300 ? 1 : 0,
    filters.skills.length > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const toggleSkill = (skill: string) => {
    const next = filters.skills.includes(skill)
      ? filters.skills.filter((s) => s !== skill)
      : [...filters.skills, skill];
    onChange({ ...filters, skills: next });
  };

  const clearAll = () => {
    onChange({ type: "All", experienceLevel: "All", salaryRange: [0, 300], skills: [] });
  };

  return (
    <div className="space-y-3">
      {/* Type pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {typeOptions.map((t) => (
          <button
            key={t}
            onClick={() => onChange({ ...filters, type: t })}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              filters.type === t
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Advanced Filters
        {activeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {activeCount}
          </span>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card space-y-5"
          >
            {/* Experience Level */}
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Experience Level</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {experienceOptions.map((e) => (
                  <button
                    key={e}
                    onClick={() => onChange({ ...filters, experienceLevel: e })}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      filters.experienceLevel === e
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Salary Range */}
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Salary Range: ${filters.salaryRange[0]}k – ${filters.salaryRange[1]}k
              </label>
              <div className="mt-3 flex items-center gap-4">
                <input
                  type="range"
                  aria-label="Minimum salary in thousands"
                  title="Minimum salary in thousands"
                  min={0}
                  max={300}
                  step={10}
                  value={filters.salaryRange[0]}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      salaryRange: [Math.min(Number(e.target.value), filters.salaryRange[1] - 10), filters.salaryRange[1]],
                    })
                  }
                  className="flex-1 accent-primary"
                />
                <input
                  type="range"
                  aria-label="Maximum salary in thousands"
                  title="Maximum salary in thousands"
                  min={0}
                  max={300}
                  step={10}
                  value={filters.salaryRange[1]}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      salaryRange: [filters.salaryRange[0], Math.max(Number(e.target.value), filters.salaryRange[0] + 10)],
                    })
                  }
                  className="flex-1 accent-primary"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Skills</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {skillOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSkill(s)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      filters.skills.includes(s)
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
              >
                <X className="h-3 w-3" />
                Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
