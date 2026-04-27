import { MapPin, Briefcase, Link as LinkIcon, Calendar, Edit2, Users, LogOut, MoreVertical, BadgeCheck, Award, Shield, Share2, Download, GraduationCap, Check, BookOpen, ExternalLink, Globe } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";

const experience = [
  { title: "Senior Software Engineer", company: "TechFlow Inc.", period: "2022 - Present", description: "Leading frontend architecture for the main product platform. Mentored 5 junior developers." },
  { title: "Software Engineer", company: "StartupX", period: "2019 - 2022", description: "Built core features leading to a 60% improvement in performance. Orchestrated the database migration." },
];

const education = [
  { degree: "M.S. Computer Science", school: "Stanford University", period: "2017 - 2019", description: "Specialized in Human-Computer Interaction." },
  { degree: "B.S. Software Engineering", school: "MIT", period: "2013 - 2017", description: "Graduated with Honors. President of the Programming Club." },
];

const projects = [
  { title: "OpenSource UI Components", link: "github.com/alex/ui", period: "2023 - Present", description: "A highly customizable component library used by 12,000+ developers." },
  { title: "ScaleDB Migration Tool", link: "github.com/alex/scaledb", period: "2022", description: "Zero-downtime database migration tool for high availability systems." },
];

const publications = [
  { title: "Building Resilient Frontend Architectures", publisher: "React Advanced Conf", date: "Oct 2023" },
  { title: "The Shift to Micro-Frontends", publisher: "Tech Insights Journal", date: "Mar 2022" },
];

const skillsWithEndorsements = [
  { name: "React", count: 42, topEndorsers: ["Sarah Chen", "James Wilson"] },
  { name: "TypeScript", count: 35, topEndorsers: ["Emily Davis", "Jane Doe"] },
  { name: "System Design", count: 28, topEndorsers: ["Michael Park"] },
  { name: "Team Leadership", count: 21, topEndorsers: ["Sarah Chen"] },
];

const badges = [
  { icon: BadgeCheck, label: "Verified", color: "text-blue-500" },
  { icon: Award, label: "Top Rated", color: "text-amber-500" },
  { icon: Shield, label: "Premium", color: "text-purple-500" },
];

export default function ProfilePage() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [customUrl, setCustomUrl] = useState("alexmorgan");
  const { logout } = useAuth();
  const userPosts = posts.slice(0, 2);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      className="mx-auto max-w-5xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main Column */}
        <div className="space-y-6">
          {/* Premium Profile Header */}
          <motion.div variants={itemVariants} className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Premium Wave Animation Background */}
            <div className="relative h-40 sm:h-56 overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-90"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}
              />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/90" />
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-md shadow-lg"
              >
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                  <Award className="h-3 w-3" /> Premium Member
                </span>
              </motion.div>
            </div>

            <div className="px-6 pb-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6 -mt-16 sm:-mt-24 relative z-10">
                {/* Avatar with Animation */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="relative group cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-32 w-32 sm:h-40 sm:w-40 rounded-2xl border-4 border-card object-cover shadow-2xl ring-4 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40"
                  />
                  <div className="absolute bottom-2 right-2 h-5 w-5 rounded-full bg-green-500 border-4 border-card shadow-lg" title="Online" />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Edit2 className="text-white h-8 w-8" />
                  </div>
                </motion.div>

                <div className="mt-4 flex-1 sm:mt-0 sm:pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h1 className="text-3xl sm:text-4xl font-bold font-display text-foreground tracking-tight">{currentUser.name}</h1>
                        <BadgeCheck className="h-7 w-7 text-blue-500 drop-shadow-sm" />
                      </div>
                      <p className="text-lg text-foreground/80 mt-1 font-medium">{currentUser.title}</p>
                      <div className="flex gap-2 mt-3">
                        {badges.map((badge, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + idx * 0.1 }}
                            key={badge.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/60 border border-border/50"
                          >
                            <badge.icon className={`h-4 w-4 ${badge.color}`} />
                            <span className="text-xs font-semibold text-foreground/70">{badge.label}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Action Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        className="p-2.5 rounded-xl hover:bg-secondary transition-colors border border-border bg-card shadow-sm hover:shadow-md"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      <AnimatePresence>
                        {profileMenuOpen && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden"
                          >
                            <button className="w-full px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-secondary flex items-center gap-3 transition-colors">
                              <Edit2 className="h-4 w-4 text-blue-500" /> Edit Profile
                            </button>
                            <button className="w-full px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-secondary flex items-center gap-3 transition-colors">
                              <Share2 className="h-4 w-4 text-green-500" /> Share Profile
                            </button>
                            <button className="w-full px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-secondary flex items-center gap-3 transition-colors">
                              <Download className="h-4 w-4 text-purple-500" /> Download CV
                            </button>
                            <div className="h-px bg-border" />
                            <button
                              onClick={() => { setProfileMenuOpen(false); logout(); }}
                              className="w-full px-4 py-3 text-left text-sm font-medium text-destructive hover:bg-destructive/10 flex items-center gap-3 transition-colors"
                            >
                              <LogOut className="h-4 w-4" /> Logout
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile URL Customization */}
              <motion.div variants={itemVariants} className="mt-5 p-3 rounded-xl bg-secondary/30 border border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-hidden">
                  <LinkIcon className="h-4 w-4 shrink-0 text-blue-500" />
                  <span className="truncate">smartconnect.io/</span>
                  {isEditingUrl ? (
                    <input 
                      type="text" 
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="bg-background border border-blue-500 rounded px-2 py-0.5 text-foreground font-medium w-32 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      autoFocus
                    />
                  ) : (
                    <span className="font-semibold text-foreground">{customUrl}</span>
                  )}
                </div>
                <button 
                  onClick={() => setIsEditingUrl(!isEditingUrl)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {isEditingUrl ? "Save" : "Customize URL"}
                </button>
              </motion.div>

              {/* Stats Row */}
              <motion.div variants={itemVariants} className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Connections", value: currentUser.connections, icon: Users },
                  { label: "Profile Views", value: "1.2K", icon: Globe },
                  { label: "Endorsements", value: "48", icon: Award },
                  { label: "Member Since", value: "2019", icon: Calendar }
                ].map((stat, i) => (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    key={i} className="rounded-xl bg-gradient-to-br from-secondary/50 to-secondary/20 p-4 border border-border/50 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                      <stat.icon className="h-3.5 w-3.5 text-muted-foreground/50" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Info Row */}
              <motion.div variants={itemVariants} className="mt-5 flex flex-wrap gap-3 text-sm text-foreground/80">
                <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors border border-transparent hover:border-border"><Briefcase className="h-4 w-4 text-blue-500" />{currentUser.company}</span>
                <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors border border-transparent hover:border-border"><MapPin className="h-4 w-4 text-red-500" />San Francisco, CA</span>
                <a href="#" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-blue-500/10 hover:text-blue-600 cursor-pointer transition-colors border border-transparent hover:border-blue-500/20"><Globe className="h-4 w-4 text-green-500" /> alexmorgan.dev</a>
              </motion.div>

              {/* Premium Action Buttons */}
              <motion.div variants={itemVariants} className="mt-6 flex gap-3 flex-wrap">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-initial rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all">
                  Connect
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-initial rounded-xl border-2 border-primary/20 bg-primary/5 px-8 py-3 text-sm font-bold text-primary hover:bg-primary/10 transition-all">
                  Message
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="hidden sm:flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-bold text-foreground hover:bg-secondary transition-colors">
                  <Share2 className="h-4 w-4" /> Share
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden rounded-2xl bg-secondary/40 border border-border p-1.5 h-auto shadow-inner no-scrollbar">
                {["About", "Featured", "Resume", "Activity"].map(tab => (
                  <TabsTrigger 
                    key={tab.toLowerCase()} 
                    value={tab.toLowerCase()} 
                    className="rounded-xl px-6 py-2.5 font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-foreground/5 text-foreground/70"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="about" className="space-y-6 mt-6 focus:outline-none">
                {/* About Section - Premium Card */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <h2 className="text-xl font-bold font-display text-foreground">About</h2>
                    </div>
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors"><Edit2 className="h-4 w-4 text-muted-foreground" /></button>
                  </div>
                  <p className="text-base leading-relaxed text-foreground/80">
                    Passionate software engineer with over 6 years of experience building highly scalable web applications. 
                    I thrive on solving complex architectural challenges and mentoring engineering teams. Currently focused 
                    on modern frontend architectures, micro-frontends, and highly interactive user interfaces.
                  </p>
                </motion.div>

                {/* Experience & Education - Grid Layout */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Experience */}
                  <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Briefcase className="h-4 w-4 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-bold font-display text-foreground">Experience</h2>
                      </div>
                    </div>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                      {experience.map((exp, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                          key={exp.title} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-card bg-secondary text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                            <Check className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card/50 shadow-sm transition-all group-hover:shadow-md group-hover:border-blue-500/30">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-bold text-foreground text-sm">{exp.title}</h3>
                              {idx === 0 && <span className="text-[10px] uppercase tracking-wider font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded">Current</span>}
                            </div>
                            <div className="text-sm text-foreground/70 mb-2">{exp.company} • {exp.period}</div>
                            <p className="text-xs text-muted-foreground">{exp.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Education */}
                  <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-bold font-display text-foreground">Education</h2>
                      </div>
                    </div>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                      {education.map((edu, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                          key={edu.degree} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-card bg-secondary text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                            <div className="h-2 w-2 rounded-full bg-purple-500" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card/50 shadow-sm transition-all group-hover:shadow-md group-hover:border-purple-500/30">
                            <h3 className="font-bold text-foreground text-sm mb-1">{edu.degree}</h3>
                            <div className="text-sm text-foreground/70 mb-2">{edu.school} • {edu.period}</div>
                            <p className="text-xs text-muted-foreground">{edu.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Skills & Endorsements */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Award className="h-4 w-4 text-green-600" />
                      </div>
                      <h2 className="text-xl font-bold font-display text-foreground">Top Skills & Endorsements</h2>
                    </div>
                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors">Manage Skills</button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {skillsWithEndorsements.map((skill, i) => (
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        key={skill.name} className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                      >
                        <div>
                          <h4 className="font-bold text-foreground text-base tracking-tight">{skill.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            Endorsed by <span className="font-semibold text-foreground/80">{skill.topEndorsers.join(", ")}</span> & others
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-lg shadow-sm">
                          <Users className="h-3.5 w-3.5 text-blue-500" />
                          <span className="font-bold text-sm">{skill.count}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-border">
                    <SkillTagger initialSkills={currentUser.skills ?? []} />
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="featured" className="space-y-6 mt-6 focus:outline-none">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid lg:grid-cols-2 gap-6">
                  {/* Projects */}
                  <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-emerald-600" />
                      </div>
                      <h2 className="text-xl font-bold font-display text-foreground">Featured Projects</h2>
                    </div>
                    <div className="space-y-4">
                      {projects.map((project) => (
                        <div key={project.title} className="p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-emerald-500/30 transition-colors group">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-foreground">{project.title}</h3>
                            <a href={`https://${project.link}`} className="text-muted-foreground hover:text-emerald-500 transition-colors"><ExternalLink className="h-4 w-4" /></a>
                          </div>
                          <p className="text-xs text-foreground/60 mb-2">{project.period}</p>
                          <p className="text-sm text-muted-foreground/90">{project.description}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Publications */}
                  <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-indigo-600" />
                      </div>
                      <h2 className="text-xl font-bold font-display text-foreground">Publications</h2>
                    </div>
                    <div className="space-y-4">
                      {publications.map((pub) => (
                        <div key={pub.title} className="p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-indigo-500/30 transition-colors">
                          <h3 className="font-bold text-foreground mb-1 leading-snug">{pub.title}</h3>
                          <p className="text-sm text-indigo-600/80 font-medium mb-1">{pub.publisher}</p>
                          <p className="text-xs text-muted-foreground">{pub.date}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent value="resume" className="mt-6 focus:outline-none">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <ResumeBuilder />
                </motion.div>
              </TabsContent>

              <TabsContent value="activity" className="mt-6 focus:outline-none">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Share2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold font-display text-foreground">Recent Activity</h2>
                  </div>
                  {userPosts.map((post) => (
                    <motion.div variants={itemVariants} key={post.id}>
                      <PostCard post={post} />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div variants={itemVariants}><ProfileStrengthScore /></motion.div>
          <motion.div variants={itemVariants}><ProfileViewTracker /></motion.div>
          <motion.div variants={itemVariants}><JobRecommendations /></motion.div>
        </div>
      </div>
    </motion.div>
  );
}

