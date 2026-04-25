import { MapPin, Briefcase, Link as LinkIcon, Calendar, Edit2, Users, LogOut, MoreVertical, BadgeCheck, Award, Shield, Share2, Download } from "lucide-react";
import { currentUser, posts } from "@/data/mockData";
import PostCard from "@/components/feed/PostCard";
import ProfileStrengthScore from "@/components/profile/ProfileStrengthScore";
import SkillTagger from "@/components/profile/SkillTagger";
import ProfileViewTracker from "@/components/profile/ProfileViewTracker";
import JobRecommendations from "@/components/profile/JobRecommendations";
import ResumeBuilder from "@/components/profile/ResumeBuilder";
import { useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const experience = [
  { title: "Senior Software Engineer", company: "TechFlow Inc.", period: "2022 - Present", description: "Leading frontend architecture for the main product platform." },
  { title: "Software Engineer", company: "StartupX", period: "2019 - 2022", description: "Built core features and improved performance by 60%." },
];

const badges = [
  { icon: BadgeCheck, label: "Verified", color: "text-blue-500" },
  { icon: Award, label: "Top Rated", color: "text-amber-500" },
  { icon: Shield, label: "Premium", color: "text-purple-500" },
];

export default function ProfilePage() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const userPosts = posts.slice(0, 2);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main Column */}
        <div className="space-y-6">
          {/* Premium Profile Header */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            {/* Premium Gradient Background */}
            <div className="relative h-32 sm:h-48">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/50" />
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-sm">
                <span className="text-xs font-semibold text-amber-600">⭐ Premium Member</span>
              </div>
            </div>

            <div className="px-6 pb-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:gap-5 -mt-12 sm:-mt-20">
                {/* Avatar with Badge */}
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-24 w-24 sm:h-36 sm:w-36 rounded-2xl border-4 border-card object-cover shadow-2xl ring-4 ring-primary/20"
                  />
                  <div className="absolute bottom-2 right-2 h-4 w-4 rounded-full bg-green-500 border-2 border-card" title="Online" />
                </div>

                <div className="mt-4 flex-1 sm:mt-0 sm:pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground">{currentUser.name}</h1>
                        <BadgeCheck className="h-6 w-6 text-blue-500" />
                      </div>
                      <p className="text-base text-muted-foreground mt-1">{currentUser.title}</p>
                      <div className="flex gap-2 mt-2">
                        {badges.map((badge) => (
                          <div key={badge.label} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/50">
                            <badge.icon className={`h-3.5 w-3.5 ${badge.color}`} />
                            <span className="text-xs font-medium text-muted-foreground">{badge.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        title="More options"
                        className="p-2 rounded-xl hover:bg-secondary transition-colors border border-border"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {profileMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card shadow-lg z-50">
                          <button className="w-full px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-secondary rounded-t-lg flex items-center gap-2 transition-colors">
                            <Edit2 className="h-4 w-4" />
                            Edit Profile
                          </button>
                          <button className="w-full px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-secondary flex items-center gap-2 transition-colors">
                            <Share2 className="h-4 w-4" />
                            Share Profile
                          </button>
                          <button className="w-full px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-secondary flex items-center gap-2 transition-colors">
                            <Download className="h-4 w-4" />
                            Download CV
                          </button>
                          <div className="h-px bg-border" />
                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              logout();
                            }}
                            className="w-full px-4 py-3 text-left text-sm font-medium text-destructive hover:bg-secondary rounded-b-lg flex items-center gap-2 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats and Info */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl bg-secondary/50 p-4 border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">Connections</div>
                  <div className="text-2xl font-bold text-foreground">{currentUser.connections}</div>
                </div>
                <div className="rounded-xl bg-secondary/50 p-4 border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">Profile Views</div>
                  <div className="text-2xl font-bold text-foreground">1.2K</div>
                </div>
                <div className="rounded-xl bg-secondary/50 p-4 border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">Endorsements</div>
                  <div className="text-2xl font-bold text-foreground">48</div>
                </div>
                <div className="rounded-xl bg-secondary/50 p-4 border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">Member Since</div>
                  <div className="text-sm font-bold text-foreground">2019</div>
                </div>
              </div>

              {/* Info Row */}
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/30"><Briefcase className="h-4 w-4" />{currentUser.company}</span>
                <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/30"><MapPin className="h-4 w-4" />San Francisco, CA</span>
                <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/30"><Calendar className="h-4 w-4" />Joined 2019</span>
              </div>

              {/* Premium Action Buttons */}
              <div className="mt-5 flex gap-3 flex-wrap">
                <button className="flex-1 sm:flex-initial rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-600/30 transition-all">
                  Connect
                </button>
                <button className="flex-1 sm:flex-initial rounded-xl border border-primary bg-primary/10 px-6 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-all">
                  Message
                </button>
                <button className="hidden sm:flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="w-full justify-start rounded-2xl bg-gradient-to-r from-secondary via-secondary to-secondary/50 border border-border p-1 h-auto shadow-sm">
              <TabsTrigger value="about" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md">About</TabsTrigger>
              <TabsTrigger value="resume" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md">Resume</TabsTrigger>
              <TabsTrigger value="activity" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md">Activity</TabsTrigger>
              <TabsTrigger value="credentials" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md">Credentials</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6 mt-6">
              {/* About Section - Premium Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                  <h2 className="text-lg font-semibold font-display text-foreground">About</h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Passionate software engineer with 5+ years of experience building scalable web applications.
                  I love solving complex problems and mentoring junior developers. Currently focused on
                  frontend architecture and design systems. Always learning, always shipping.
                </p>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground">Profile completion: 85%</div>
                  <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full w-[85%] bg-gradient-to-r from-blue-600 to-purple-600" />
                  </div>
                </div>
              </div>

              {/* Experience - Premium Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                  <h2 className="text-lg font-semibold font-display text-foreground">Experience</h2>
                </div>
                <div className="mt-4 space-y-5">
                  {experience.map((exp, idx) => (
                    <div key={exp.title} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-600/20">
                        <Briefcase className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{exp.title}</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">{exp.company}</p>
                          </div>
                          {idx === 0 && <span className="px-2 py-1 text-xs font-semibold bg-green-500/20 text-green-700 rounded-lg">Current</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{exp.period}</p>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills - Premium Card */}
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

            <TabsContent value="credentials" className="mt-6 space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <BadgeCheck className="h-5 w-5 text-blue-500" />
                  <h2 className="text-lg font-semibold font-display text-foreground">Certifications & Credentials</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-blue-500/20">
                    <Award className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">AWS Solutions Architect</h3>
                      <p className="text-sm text-muted-foreground mt-1">Amazon Web Services • Issued Feb 2024</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-purple-500/20">
                    <Award className="h-6 w-6 text-purple-600 shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">React Expert Certification</h3>
                      <p className="text-sm text-muted-foreground mt-1">Coursera • Issued Jan 2023</p>
                    </div>
                  </div>
                </div>
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
