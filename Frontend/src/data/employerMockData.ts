export type ApplicantStatus = "New" | "Reviewing" | "Accepted" | "Rejected";
export type InterviewMode = "Video" | "Phone" | "Onsite";

export interface CompanyProfile {
  name: string;
  industry: string;
  size: string;
  website: string;
  headquarters: string;
  description: string;
  logo: string;
}

export interface EmployerJob {
  id: string;
  title: string;
  location: string;
  remotePolicy: "Onsite" | "Hybrid" | "Remote";
  salary: string;
  salaryMin: number;
  salaryMax: number;
  type: string;
  level: "Entry" | "Mid" | "Senior" | "Lead";
  requiredSkills: string[];
  description: string;
  postedAt: string;
  applicants: number;
  featured: boolean;
}

export interface EmployerApplicant {
  id: string;
  name: string;
  role: string;
  avatar: string;
  skills: string[];
  appliedFor: string;
  match: number;
  status: ApplicantStatus;
  notes?: string;
}

export interface EmployerInterview {
  id: string;
  candidate: string;
  role: string;
  date: string;
  time: string;
  mode: InterviewMode;
}

export interface CompanyPost {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export const companyProfile: CompanyProfile = {
  name: "CloudScale",
  industry: "Cloud Infrastructure",
  size: "250-500 employees",
  website: "cloudscale.dev",
  headquarters: "Austin, Texas",
  description:
    "CloudScale builds reliable infrastructure products for fast-growing tech teams and hires across product, platform, and growth.",
  logo: "https://images.unsplash.com/photo-1568952433726-3896e3881c65?w=120&h=120&fit=crop",
};

export const employerJobs: EmployerJob[] = [
  {
    id: "job-1",
    title: "Senior Frontend Engineer",
    location: "Remote",
    remotePolicy: "Remote",
    salary: "$140k - $180k",
    salaryMin: 140,
    salaryMax: 180,
    type: "Full-time",
    level: "Senior",
    requiredSkills: ["React", "TypeScript", "Design Systems"],
    description: "Lead frontend architecture and mentor engineers across key customer surfaces.",
    postedAt: "2 days ago",
    applicants: 24,
    featured: true,
  },
  {
    id: "job-2",
    title: "Product Designer",
    location: "San Francisco, CA",
    remotePolicy: "Hybrid",
    salary: "$110k - $145k",
    salaryMin: 110,
    salaryMax: 145,
    type: "Full-time",
    level: "Mid",
    requiredSkills: ["Figma", "User Research", "Design Systems"],
    description: "Design and validate high-impact user journeys across web and mobile.",
    postedAt: "4 days ago",
    applicants: 17,
    featured: false,
  },
  {
    id: "job-3",
    title: "Growth Marketing Lead",
    location: "New York, NY",
    remotePolicy: "Onsite",
    salary: "$95k - $130k",
    salaryMin: 95,
    salaryMax: 130,
    type: "Hybrid",
    level: "Lead",
    requiredSkills: ["Growth", "SEO", "Analytics"],
    description: "Own pipeline growth strategies and collaborate tightly with product and sales.",
    postedAt: "1 week ago",
    applicants: 11,
    featured: false,
  },
];

export const employerApplicants: EmployerApplicant[] = [
  {
    id: "app-1",
    name: "Amina Noor",
    role: "Frontend Engineer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    skills: ["React", "TypeScript", "Design Systems"],
    appliedFor: "Senior Frontend Engineer",
    match: 92,
    status: "New",
    notes: "Strong portfolio and frontend architecture examples.",
  },
  {
    id: "app-2",
    name: "Daniel Lee",
    role: "Product Designer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    skills: ["Figma", "User Research", "Prototyping"],
    appliedFor: "Product Designer",
    match: 88,
    status: "Reviewing",
    notes: "Great product thinking; schedule whiteboard case study.",
  },
  {
    id: "app-3",
    name: "Priya Sharma",
    role: "Marketing Strategist",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    skills: ["SEO", "Campaigns", "Analytics"],
    appliedFor: "Growth Marketing Lead",
    match: 81,
    status: "Accepted",
    notes: "Excellent campaign metrics and leadership experience.",
  },
  {
    id: "app-4",
    name: "Marcus Chen",
    role: "Full Stack Engineer",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    skills: ["Node.js", "React", "AWS"],
    appliedFor: "Senior Frontend Engineer",
    match: 72,
    status: "Rejected",
    notes: "Solid profile but backend-heavy for this role.",
  },
];

export const employerInterviews: EmployerInterview[] = [
  {
    id: "int-1",
    candidate: "Amina Noor",
    role: "Senior Frontend Engineer",
    date: "Apr 10, 2026",
    time: "10:30 AM",
    mode: "Video",
  },
  {
    id: "int-2",
    candidate: "Daniel Lee",
    role: "Product Designer",
    date: "Apr 11, 2026",
    time: "02:00 PM",
    mode: "Onsite",
  },
];

export const companyPosts: CompanyPost[] = [
  {
    id: "post-1",
    title: "We’re hiring across product and engineering",
    body: "CloudScale is opening new roles in design, frontend, and growth. Join us if you love shipping with fast-moving teams.",
    createdAt: "Today",
  },
  {
    id: "post-2",
    title: "Inside our culture of mentorship",
    body: "Every new hire is paired with a mentor for the first 90 days to help them ramp quickly and confidently.",
    createdAt: "3 days ago",
  },
];
