import { MapPin, Briefcase, Link as LinkIcon, Calendar, Edit2, Users } from "lucide-react";
import { currentUser, posts } from "@/data/mockData";
import PostCard from "@/components/feed/PostCard";
import ProfileStrengthScore from "@/components/profile/ProfileStrengthScore";
import SkillTagger from "@/components/profile/SkillTagger";
import ProfileViewTracker from "@/components/profile/ProfileViewTracker";
import JobRecommendations from "@/components/profile/JobRecommendations";
import ResumeBuilder from "@/components/profile/ResumeBuilder";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const experience = [
  { title: "Senior Software Engineer", company: "TechFlow Inc.", period: "2022 - Present", description: "Leading frontend architecture for the main product platform." },
  { title: "Software Engineer", company: "StartupX", period: "2019 - 2022", description: "Built core features and improved performance by 60%." },
];

export default function ProfilePage() {
  const userPosts = posts.slice(0, 2);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main Column */}
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="h-32 bg-gradient-to-r from-primary via-primary/80 to-accent sm:h-44" />
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:gap-5 -mt-12 sm:-mt-16">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl border-4 border-card object-cover shadow-elevated"
                />
                <div className="mt-3 flex-1 sm:mt-0 sm:pb-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-xl font-bold font-display text-foreground sm:text-2xl">{currentUser.name}</h1>
                      <p className="text-sm text-muted-foreground">{currentUser.title}</p>
                    </div>
                    <button className="hidden sm:flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" />{currentUser.company}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />San Francisco, CA</span>
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{currentUser.connections} connections</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />Joined 2019</span>
              </div>

              <div className="mt-4 flex gap-3">
                <button className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all">
                  Connect
                </button>
                <button className="rounded-xl border border-primary px-6 py-2.5 text-sm font-semibold text-primary hover:bg-brand-light transition-all">
                  Message
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="w-full justify-start rounded-2xl bg-card border border-border p-1 h-auto">
              <TabsTrigger value="about" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">About</TabsTrigger>
              <TabsTrigger value="resume" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Resume</TabsTrigger>
              <TabsTrigger value="activity" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6 mt-6">
              {/* About */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h2 className="text-lg font-semibold font-display text-foreground">About</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Passionate software engineer with 5+ years of experience building scalable web applications.
                  I love solving complex problems and mentoring junior developers. Currently focused on
                  frontend architecture and design systems. Always learning, always shipping.
                </p>
              </div>

              {/* Experience */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h2 className="text-lg font-semibold font-display text-foreground">Experience</h2>
                <div className="mt-4 space-y-5">
                  {experience.map((exp) => (
                    <div key={exp.title} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{exp.title}</h3>
                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                        <p className="text-xs text-muted-foreground">{exp.period}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <SkillTagger initialSkills={currentUser.skills ?? []} />
            </TabsContent>

            <TabsContent value="resume" className="mt-6">
              <ResumeBuilder />
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold font-display text-foreground">Recent Activity</h2>
                {userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ProfileStrengthScore />
          <ProfileViewTracker />
          <JobRecommendations />
        </div>
      </div>
    </div>
  );
}
