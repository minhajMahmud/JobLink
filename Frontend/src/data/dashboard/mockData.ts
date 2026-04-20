export type SkillLevel = "Beginner" | "Intermediate" | "Expert";
export type JobLevel = "Entry" | "Mid" | "Senior" | "Lead";

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  endorsements?: number;
  endorsed: boolean;
}

export interface ProfileStrengthItem {
  id: string;
  label: string;
  completed: boolean;
  weight: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  level: JobLevel;
  matchPercentage: number;
  description: string;
  logo?: string;
  saved?: boolean;
}

export interface ViewData {
  date: string;
  views: number;
}

export interface ProfileMetrics {
  totalViews: number;
  weeklyGrowth: number;
  recruiterViews: number;
  viewTrend: ViewData[];
}

// Trending skills for suggestions
export const TRENDING_SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "AWS",
  "System Design",
  "SQL",
  "Docker",
  "Kubernetes",
  "GraphQL",
  "Vue.js",
  "Angular",
  "FastAPI",
  "Rust",
  "Go",
  "Machine Learning",
  "Data Science",
  "DevOps",
  "Cloud Architecture",
  "API Design",
];

export const PROFICIENCY_LEVELS: SkillLevel[] = ["Beginner", "Intermediate", "Expert"];

// Mock user skills
export const MOCK_USER_SKILLS: Skill[] = [
  {
    id: "1",
    name: "React",
    level: "Expert",
    endorsements: 45,
    endorsed: true,
  },
  {
    id: "2",
    name: "TypeScript",
    level: "Expert",
    endorsements: 32,
    endorsed: true,
  },
  {
    id: "3",
    name: "Node.js",
    level: "Intermediate",
    endorsements: 18,
    endorsed: false,
  },
  {
    id: "4",
    name: "AWS",
    level: "Intermediate",
    endorsements: 12,
    endorsed: false,
  },
];

// Mock profile strength data
export const MOCK_PROFILE_STRENGTH: ProfileStrengthItem[] = [
  {
    id: "resume",
    label: "Resume",
    completed: true,
    weight: 25,
  },
  {
    id: "photo",
    label: "Profile Photo",
    completed: true,
    weight: 15,
  },
  {
    id: "skills",
    label: "Skills (3+ needed)",
    completed: true,
    weight: 20,
  },
  {
    id: "experience",
    label: "Work Experience",
    completed: false,
    weight: 25,
  },
  {
    id: "education",
    label: "Education",
    completed: false,
    weight: 15,
  },
];

// Mock job recommendations
export const MOCK_JOB_RECOMMENDATIONS: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    company: "TechFlow",
    location: "San Francisco, CA",
    salary: "$150k - $200k",
    level: "Senior",
    matchPercentage: 95,
    description: "Build scalable web applications with React and TypeScript",
    logo: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100&h=100&fit=crop",
    saved: false,
  },
  {
    id: "2",
    title: "Full Stack Developer",
    company: "CloudScale",
    location: "Remote",
    salary: "$120k - $160k",
    level: "Mid",
    matchPercentage: 88,
    description: "Work on microservices with Node.js and React",
    logo: "https://images.unsplash.com/photo-1568952433726-3896e3881c65?w=100&h=100&fit=crop",
    saved: true,
  },
  {
    id: "3",
    title: "DevOps Engineer",
    company: "InfraWorks",
    location: "Austin, TX",
    salary: "$130k - $170k",
    level: "Senior",
    matchPercentage: 82,
    description: "Manage cloud infrastructure and CI/CD pipelines",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
    saved: false,
  },
  {
    id: "4",
    title: "React Developer",
    company: "DesignHub",
    location: "New York, NY",
    salary: "$110k - $150k",
    level: "Mid",
    matchPercentage: 91,
    description: "Create engaging user interfaces with modern tooling",
    logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&h=100&fit=crop",
    saved: false,
  },
  {
    id: "5",
    title: "Platform Engineer",
    company: "DataVault",
    location: "Seattle, WA",
    salary: "$140k - $190k",
    level: "Senior",
    matchPercentage: 85,
    description: "Build infrastructure for data processing and storage",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
    saved: false,
  },
];

// Mock profile view metrics
export const MOCK_PROFILE_METRICS: ProfileMetrics = {
  totalViews: 324,
  weeklyGrowth: 18,
  recruiterViews: 42,
  viewTrend: [
    { date: "Mon", views: 12 },
    { date: "Tue", views: 19 },
    { date: "Wed", views: 15 },
    { date: "Thu", views: 22 },
    { date: "Fri", views: 28 },
    { date: "Sat", views: 18 },
    { date: "Sun", views: 25 },
  ],
};
