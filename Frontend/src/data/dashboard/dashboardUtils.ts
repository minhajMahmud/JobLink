import type { ProfileStrengthItem } from "./mockData";

/**
 * Calculate profile strength score based on completed sections
 */
export function calculateProfileStrength(items: ProfileStrengthItem[]): number {
  if (items.length === 0) return 0;

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const completedWeight = items
    .filter((item) => item.completed)
    .reduce((sum, item) => sum + item.weight, 0);

  return Math.round((completedWeight / totalWeight) * 100);
}

/**
 * Get missing profile sections
 */
export function getMissingProfileSections(items: ProfileStrengthItem[]): ProfileStrengthItem[] {
  return items.filter((item) => !item.completed);
}

/**
 * Get proficiency level color
 */
export function getProficiencyColor(level: string): string {
  const colors: Record<string, string> = {
    Beginner: "bg-blue-100 text-blue-800 border-blue-200",
    Intermediate: "bg-amber-100 text-amber-800 border-amber-200",
    Expert: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
  return colors[level] || "bg-slate-100 text-slate-800 border-slate-200";
}

/**
 * Get match percentage color based on value
 */
export function getMatchColor(percentage: number): string {
  if (percentage >= 90) return "text-emerald-600";
  if (percentage >= 75) return "text-blue-600";
  if (percentage >= 60) return "text-amber-600";
  return "text-slate-600";
}

/**
 * Get match percentage background color
 */
export function getMatchBgColor(percentage: number): string {
  if (percentage >= 90) return "bg-emerald-50";
  if (percentage >= 75) return "bg-blue-50";
  if (percentage >= 60) return "bg-amber-50";
  return "bg-slate-50";
}

/**
 * Format large numbers
 */
export function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

/**
 * Get growth trend text and color
 */
export function getGrowthTrend(growth: number): {
  text: string;
  color: string;
  icon: string;
} {
  if (growth > 0) {
    return {
      text: `+${growth}% this week`,
      color: "text-emerald-600",
      icon: "↑",
    };
  }
  if (growth < 0) {
    return {
      text: `${growth}% this week`,
      color: "text-red-600",
      icon: "↓",
    };
  }
  return {
    text: "No change this week",
    color: "text-slate-600",
    icon: "→",
  };
}

/**
 * Debounce function for search
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Filter skills by search term
 */
export function filterSkills(skills: string[], searchTerm: string): string[] {
  if (!searchTerm) return [];
  const term = searchTerm.toLowerCase();
  return skills.filter((skill) => skill.toLowerCase().includes(term)).slice(0, 5);
}
