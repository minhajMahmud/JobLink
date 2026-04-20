import React, { useState, useCallback, useMemo } from "react";
import { Search, X, Filter, Save, ChevronDown } from "lucide-react";
import type { CandidateFilter } from "@/modules/recruiter/types";

interface CandidateFilterPanelProps {
  onFilterChange: (filters: CandidateFilter) => void;
  onSaveSearch?: (name: string, filters: CandidateFilter) => void;
  loading?: boolean;
}

export const CandidateFilterPanel: React.FC<CandidateFilterPanelProps> = ({
  onFilterChange,
  onSaveSearch,
  loading = false,
}) => {
  const [filters, setFilters] = useState<CandidateFilter>({});
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchName, setSearchName] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleFilterChange = useCallback(
    (key: keyof CandidateFilter, value: any) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);

      // Track active filters
      if (value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0)) {
        setActiveFilters((prev) => [...new Set([...prev, key])]);
      } else {
        setActiveFilters((prev) => prev.filter((f) => f !== key));
      }

      onFilterChange(newFilters);
    },
    [filters, onFilterChange],
  );

  const handleRemoveFilter = (key: keyof CandidateFilter) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    setActiveFilters((prev) => prev.filter((f) => f !== key));
    onFilterChange(newFilters);
  };

  const handleSaveSearch = () => {
    if (searchName.trim() && onSaveSearch) {
      onSaveSearch(searchName, filters);
      setSearchName("");
      setShowSaveModal(false);
    }
  };

  const handleClearAll = () => {
    setFilters({});
    setActiveFilters([]);
    onFilterChange({});
  };

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between rounded-lg bg-white border border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-600" />
          <h2 className="font-semibold text-slate-900">Advanced Filters</h2>
          {activeFilters.length > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {activeFilters.length} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilters.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
             className="text-slate-600 hover:bg-slate-100 rounded p-1"
             title="Toggle filters"
             aria-label="Toggle filters panel"
          >
            <ChevronDown
              className={`h-5 w-5 transition-transform ${isExpanded ? "" : "-rotate-90"}`}
            />
          </button>
        </div>
      </div>

      {/* Filters Container */}
      {isExpanded && (
        <div className="space-y-4 rounded-lg bg-white border border-slate-200 p-4">
          {/* Search Query */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Name, skills, keywords..."
                value={filters.search_query || ""}
                onChange={(e) => handleFilterChange("search_query", e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Skills</label>
            <input
              type="text"
              placeholder="e.g., React, Python, AWS (comma-separated)"
              value={filters.skills?.join(", ") || ""}
              onChange={(e) =>
                handleFilterChange(
                  "skills",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s),
                )
              }
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
            />
          </div>

          {/* Experience Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Min Years</label>
              <input
                type="number"
                min="0"
                max="50"
                placeholder="0"
                value={filters.experience_min || ""}
                onChange={(e) => handleFilterChange("experience_min", parseInt(e.target.value))}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Max Years</label>
              <input
                type="number"
                min="0"
                max="50"
                placeholder="50"
                value={filters.experience_max || ""}
                onChange={(e) => handleFilterChange("experience_max", parseInt(e.target.value))}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Education Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Education</label>
            <select
               title="Select education levels"
               aria-label="Education level filter"
              multiple
              value={filters.education_level || []}
              onChange={(e) =>
                handleFilterChange(
                  "education_level",
                  Array.from(e.target.selectedOptions, (o) => o.value),
                )
              }
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
            >
              <option value="High School">High School</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Master">Master</option>
              <option value="PhD">PhD</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">Hold Ctrl to select multiple</p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
            <input
              type="text"
              placeholder="e.g., Remote, San Francisco, USA"
              value={filters.location || ""}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
            />
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Availability</label>
            <select
               title="Select candidate availability"
               aria-label="Availability status filter"
              value={filters.availability_status || ""}
              onChange={(e) => handleFilterChange("availability_status", e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
            >
              <option value="">All</option>
              <option value="Available">Available</option>
              <option value="Actively Looking">Actively Looking</option>
              <option value="Open to Opportunities">Open to Opportunities</option>
            </select>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Min Salary</label>
              <input
                type="number"
                placeholder="$"
                value={filters.salary_min || ""}
                onChange={(e) => handleFilterChange("salary_min", parseInt(e.target.value))}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Max Salary</label>
              <input
                type="number"
                placeholder="$"
                value={filters.salary_max || ""}
                onChange={(e) => handleFilterChange("salary_max", parseInt(e.target.value))}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
            <select
               title="Select sorting order"
               aria-label="Sort candidates by"
              value={filters.sort_by || "relevance"}
              onChange={(e) => handleFilterChange("sort_by", e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
            >
              <option value="relevance">Relevance Score</option>
              <option value="recently_active">Recently Active</option>
              <option value="experience">Experience Level</option>
            </select>
          </div>

          {/* Save Search Button */}
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={loading || activeFilters.length === 0}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 disabled:bg-slate-300"
          >
            <Save className="h-4 w-4" />
            Save Search as Preset
          </button>
        </div>
      )}

      {/* Active Filters Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <div
              key={filter}
              className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium"
            >
              <span>
                {filter}: {JSON.stringify(filters[filter as keyof CandidateFilter]).substring(0, 30)}
                {JSON.stringify(filters[filter as keyof CandidateFilter]).length > 30 ? "..." : ""}
              </span>
              <button
                onClick={() => handleRemoveFilter(filter as keyof CandidateFilter)}
                 title="Remove filter"
                 aria-label={`Remove ${filter} filter`}
                className="text-blue-600 hover:text-blue-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Save This Search</h3>
            <input
              type="text"
              placeholder="Enter a name (e.g., Senior React Developers)"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 rounded-lg border border-slate-300 text-slate-900 py-2 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSearch}
                disabled={!searchName.trim()}
                className="flex-1 rounded-lg bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 disabled:bg-slate-300"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateFilterPanel;
