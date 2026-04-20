import React, { useState } from "react";
import { SkillTagger } from "./modules/SkillTagger";
import { ProfileStrengthScore } from "./modules/ProfileStrengthScore";
import { JobRecommendations } from "./modules/JobRecommendations";
import { ProfileViewTracking } from "./modules/ProfileViewTracking";
import { MOCK_PROFILE_STRENGTH } from "@/data/dashboard/mockData";

interface ProfileDashboardProps {
  loading?: boolean;
}

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ loading = false }) => {
  const [profileStrength, setProfileStrength] = useState(MOCK_PROFILE_STRENGTH);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header Section */}
      <div className="border-b border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Profile Dashboard
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Manage your professional profile and career opportunities
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Row 1: Profile Strength + Skills */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <ProfileStrengthScore items={profileStrength} loading={loading} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <SkillTagger
                onSkillsChange={(skills) => {
                  // Handle skills change
                  console.log("Skills updated:", skills);
                }}
                loading={loading}
              />
            </div>
          </div>

          {/* Row 2: Job Recommendations */}
          <div>
            <JobRecommendations
              loading={loading}
              onApply={(jobId) => {
                console.log("Applied to job:", jobId);
              }}
              onSave={(jobId) => {
                console.log("Saved job:", jobId);
              }}
            />
          </div>

          {/* Row 3: Profile View Tracking */}
          <div>
            <ProfileViewTracking loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
