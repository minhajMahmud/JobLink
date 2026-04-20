import React, { useState, useCallback, useMemo } from "react";
import { X, Plus, Loader2, AlertCircle } from "lucide-react";
import type { Skill, SkillLevel } from "@/data/dashboard/mockData";
import {
  TRENDING_SKILLS,
  PROFICIENCY_LEVELS,
  MOCK_USER_SKILLS,
} from "@/data/dashboard/mockData";
import { getProficiencyColor, filterSkills, debounce } from "@/data/dashboard/dashboardUtils";

const MAX_SKILLS = 20;

interface SkillTaggerProps {
  onSkillsChange?: (skills: Skill[]) => void;
  loading?: boolean;
}

export const SkillTagger: React.FC<SkillTaggerProps> = ({
  onSkillsChange,
  loading = false,
}) => {
  const [skills, setSkills] = useState<Skill[]>(MOCK_USER_SKILLS);
  const [inputValue, setInputValue] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>("Intermediate");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usedSkills = useMemo(() => skills.map((s) => s.name.toLowerCase()), [skills]);

  const handleSearch = useCallback(
    (value: string) => {
      if (!value.trim()) {
        setSuggestions([]);
        return;
      }

      const filtered = filterSkills(TRENDING_SKILLS, value).filter(
        (skill) => !usedSkills.includes(skill.toLowerCase()),
      );

      setSuggestions(filtered);
      setShowSuggestions(true);
    },
    [usedSkills],
  );

  const debouncedSearch = useMemo(() => debounce(handleSearch, 300), [handleSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setError(null);
    debouncedSearch(value);
  };

  const addSkill = (skillName: string, level: SkillLevel = selectedLevel) => {
    if (skills.length >= MAX_SKILLS) {
      setError(`Maximum ${MAX_SKILLS} skills reached`);
      return;
    }

    const trimmedName = skillName.trim();

    if (!trimmedName) {
      setError("Please enter a skill name");
      return;
    }

    const isDuplicate = skills.some(
      (s) => s.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (isDuplicate) {
      setError("This skill is already added");
      return;
    }

    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      name: trimmedName,
      level,
      endorsements: 0,
      endorsed: false,
    };

    const updatedSkills = [...skills, newSkill];
    setSkills(updatedSkills);
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
    onSkillsChange?.(updatedSkills);
  };

  const removeSkill = (skillId: string) => {
    const updatedSkills = skills.filter((s) => s.id !== skillId);
    setSkills(updatedSkills);
    onSkillsChange?.(updatedSkills);
  };

  const updateSkillLevel = (skillId: string, level: SkillLevel) => {
    const updatedSkills = skills.map((s) => (s.id === skillId ? { ...s, level } : s));
    setSkills(updatedSkills);
    onSkillsChange?.(updatedSkills);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-900">
          Add Skills
          <span className="ml-2 text-xs text-slate-500">
            ({skills.length}/{MAX_SKILLS})
          </span>
        </label>

        {/* Input Row */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => inputValue && setShowSuggestions(true)}
              placeholder="e.g., React, Python, Design..."
              disabled={loading || skills.length >= MAX_SKILLS}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
              aria-label="Skill input"
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border border-slate-200 bg-white shadow-md">
                {suggestions.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => addSkill(skill)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg"
                    type="button"
                  >
                    <Plus className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">{skill}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Level Selector */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as SkillLevel)}
            disabled={loading}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
            aria-label="Proficiency level"
          >
            {PROFICIENCY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          {/* Add Button */}
          <button
            onClick={() => addSkill(inputValue)}
            disabled={loading || !inputValue.trim() || skills.length >= MAX_SKILLS}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300"
            aria-label="Add skill"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Skills Display */}
      {skills.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-slate-500">Your Skills</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className={`group relative rounded-full px-3 py-1.5 text-sm font-medium border transition-all hover:shadow-md ${getProficiencyColor(skill.level)}`}
              >
                <div className="flex items-center gap-2">
                  <span>{skill.name}</span>

                  {/* Level Badge */}
                  <span className="text-xs opacity-75">·{skill.level[0]}</span>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeSkill(skill.id)}
                    className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label={`Remove ${skill.name}`}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>

                {/* Level Dropdown (on hover) */}
                <div className="absolute top-full left-0 mt-1 hidden rounded-lg border border-slate-200 bg-white shadow-lg group-hover:block">
                  {PROFICIENCY_LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => updateSkillLevel(skill.id, level)}
                      className={`w-full px-3 py-1 text-left text-xs hover:bg-slate-100 first:rounded-t-lg last:rounded-b-lg ${skill.level === level ? "bg-slate-100 font-semibold" : ""}`}
                      type="button"
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600">No skills added yet</p>
          <p className="text-xs text-slate-500">Add skills to improve your profile visibility</p>
        </div>
      )}

      {/* Trending Skills */}
      {skills.length < MAX_SKILLS && (
        <div className="space-y-2 border-t border-slate-200 pt-4">
          <p className="text-xs font-medium uppercase text-slate-500">Trending Skills</p>
          <div className="flex flex-wrap gap-2">
            {TRENDING_SKILLS.slice(0, 8).map((skill) => (
              <button
                key={skill}
                onClick={() => addSkill(skill)}
                disabled={
                  loading ||
                  usedSkills.includes(skill.toLowerCase()) ||
                  skills.length >= MAX_SKILLS
                }
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTagger;
