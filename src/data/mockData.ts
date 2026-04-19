export interface User {
  id: string;
  name: string;
  title: string;
  avatar: string;
  company?: string;
  connections: number;
  role: 'seeker' | 'employer' | 'admin';
  skills?: string[];
  experience?: number; // years
  education?: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  shares: number;
  liked: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  salary: string;
  salaryMin: number;
  salaryMax: number;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  description: string;
  requirements: string[];
  skills: string[];
  postedAt: string;
  applicants: number;
}

export type ApplicationStatus = 'Applied' | 'Shortlisted' | 'Interview' | 'Rejected' | 'Hired';

export interface Application {
  id: string;
  jobId: string;
  job: Job;
  appliedAt: string;
  status: ApplicationStatus;
  statusHistory: { status: ApplicationStatus; date: string }[];
}

export const currentUser: User = {
  id: '1',
  name: 'Alex Morgan',
  title: 'Senior Software Engineer',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  company: 'TechFlow Inc.',
  connections: 482,
  role: 'seeker',
  skills: ['React', 'TypeScript', 'System design', 'Team leadership', 'Node.js', 'AWS', 'CI/CD pipelines'],
  experience: 6,
  education: 'BS Computer Science',
};

export const users: User[] = [
  currentUser,
  { id: '2', name: 'Sarah Chen', title: 'Product Designer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', company: 'DesignHub', connections: 621, role: 'seeker', skills: ['Figma', 'User research', 'Design systems'], experience: 4 },
  { id: '3', name: 'James Wilson', title: 'Engineering Manager', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', company: 'CloudScale', connections: 1203, role: 'employer', skills: ['Kubernetes', 'Team management'], experience: 10 },
  { id: '4', name: 'Emily Davis', title: 'Data Scientist', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', company: 'DataVault', connections: 315, role: 'seeker', skills: ['Python', 'SQL', 'Machine Learning'], experience: 3 },
  { id: '5', name: 'Michael Park', title: 'HR Director', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', company: 'PeopleFirst', connections: 892, role: 'employer', skills: ['Recruiting', 'People management'], experience: 8 },
];

export const posts: Post[] = [
  {
    id: '1',
    author: users[1],
    content: 'Just shipped a complete redesign of our dashboard! 🚀 After 3 months of user research and iteration, we achieved a 40% increase in user engagement. Design thinking really works when you listen to your users.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    likes: 142,
    comments: [
      { id: 'c1', author: users[2], content: 'Amazing work Sarah! The new dashboard looks incredible.', createdAt: '2h ago' },
      { id: 'c2', author: users[3], content: 'Love the attention to detail here. Would love to chat about your research process.', createdAt: '1h ago' },
    ],
    shares: 23,
    liked: false,
    createdAt: '3h ago',
  },
  {
    id: '2',
    author: users[2],
    content: 'We\'re hiring senior engineers at CloudScale! If you\'re passionate about distributed systems and want to work on problems at massive scale, DM me. Remote-friendly, great benefits, and an amazing team.',
    likes: 89,
    comments: [
      { id: 'c3', author: users[0], content: 'This sounds exciting! Just sent you a message.', createdAt: '30m ago' },
    ],
    shares: 45,
    liked: true,
    createdAt: '5h ago',
  },
  {
    id: '3',
    author: users[3],
    content: 'Hot take: The best code is the code you don\'t write. Spent the morning removing 2000 lines of legacy code and the system is now 3x faster. Sometimes less truly is more. 🧹✨',
    likes: 234,
    comments: [],
    shares: 67,
    liked: false,
    createdAt: '8h ago',
  },
  {
    id: '4',
    author: users[4],
    content: 'Excited to announce our new mentorship program for early-career professionals! We\'re pairing experienced leaders with rising talent across all departments. Apply through the link in the comments.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
    likes: 178,
    comments: [
      { id: 'c4', author: users[1], content: 'This is such a great initiative! Applied!', createdAt: '2h ago' },
    ],
    shares: 56,
    liked: false,
    createdAt: '12h ago',
  },
];

export const jobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'TechFlow Inc.',
    companyLogo: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=60&h=60&fit=crop',
    location: 'San Francisco, CA',
    salary: '$150k - $200k',
    salaryMin: 150,
    salaryMax: 200,
    type: 'Full-time',
    experienceLevel: 'Senior',
    description: 'We\'re looking for a Senior Frontend Engineer to lead the development of our next-generation web platform.',
    requirements: ['5+ years React experience', 'TypeScript proficiency', 'System design skills', 'Team leadership'],
    skills: ['React', 'TypeScript', 'System design', 'Team leadership'],
    postedAt: '2 days ago',
    applicants: 45,
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'DesignHub',
    companyLogo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=60&h=60&fit=crop',
    location: 'Remote',
    salary: '$120k - $160k',
    salaryMin: 120,
    salaryMax: 160,
    type: 'Remote',
    experienceLevel: 'Mid',
    description: 'Join our design team to create beautiful and intuitive experiences for millions of users worldwide.',
    requirements: ['3+ years product design', 'Figma expertise', 'User research', 'Design systems'],
    skills: ['Figma', 'User research', 'Design systems', 'Prototyping'],
    postedAt: '1 day ago',
    applicants: 32,
  },
  {
    id: '3',
    title: 'Data Engineer',
    company: 'DataVault',
    companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=60&h=60&fit=crop',
    location: 'New York, NY',
    salary: '$140k - $180k',
    salaryMin: 140,
    salaryMax: 180,
    type: 'Full-time',
    experienceLevel: 'Senior',
    description: 'Build and maintain data pipelines that process billions of events daily.',
    requirements: ['Python/Scala', 'Apache Spark', 'AWS/GCP', 'SQL expertise'],
    skills: ['Python', 'SQL', 'Apache Spark', 'AWS'],
    postedAt: '3 days ago',
    applicants: 28,
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'CloudScale',
    companyLogo: 'https://images.unsplash.com/photo-1568952433726-3896e3881c65?w=60&h=60&fit=crop',
    location: 'Austin, TX',
    salary: '$130k - $170k',
    salaryMin: 130,
    salaryMax: 170,
    type: 'Full-time',
    experienceLevel: 'Mid',
    description: 'Help us scale our infrastructure to support the next million users.',
    requirements: ['Kubernetes', 'Terraform', 'CI/CD pipelines', 'Monitoring'],
    skills: ['Kubernetes', 'Terraform', 'CI/CD pipelines', 'AWS'],
    postedAt: '5 days ago',
    applicants: 19,
  },
  {
    id: '5',
    title: 'Marketing Coordinator',
    company: 'PeopleFirst',
    companyLogo: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=60&h=60&fit=crop',
    location: 'Chicago, IL',
    salary: '$60k - $80k',
    salaryMin: 60,
    salaryMax: 80,
    type: 'Part-time',
    experienceLevel: 'Entry',
    description: 'Support our marketing team with campaign management and analytics.',
    requirements: ['Marketing degree', 'Social media', 'Analytics tools', 'Content creation'],
    skills: ['Social media', 'Analytics tools', 'Content creation', 'SEO'],
    postedAt: '1 week ago',
    applicants: 52,
  },
  {
    id: '6',
    title: 'Full Stack Developer',
    company: 'CloudScale',
    companyLogo: 'https://images.unsplash.com/photo-1568952433726-3896e3881c65?w=60&h=60&fit=crop',
    location: 'Remote',
    salary: '$110k - $150k',
    salaryMin: 110,
    salaryMax: 150,
    type: 'Remote',
    experienceLevel: 'Mid',
    description: 'Build end-to-end features across our entire platform stack.',
    requirements: ['React', 'Node.js', 'PostgreSQL', 'REST APIs'],
    skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    postedAt: '4 days ago',
    applicants: 37,
  },
  {
    id: '7',
    title: 'Junior React Developer',
    company: 'TechFlow Inc.',
    companyLogo: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=60&h=60&fit=crop',
    location: 'San Francisco, CA',
    salary: '$80k - $110k',
    salaryMin: 80,
    salaryMax: 110,
    type: 'Full-time',
    experienceLevel: 'Entry',
    description: 'Great opportunity for a motivated junior developer to grow with our frontend team.',
    requirements: ['React basics', 'JavaScript', 'CSS', 'Git'],
    skills: ['React', 'JavaScript', 'CSS'],
    postedAt: '1 day ago',
    applicants: 68,
  },
  {
    id: '8',
    title: 'Technical Lead',
    company: 'DataVault',
    companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=60&h=60&fit=crop',
    location: 'New York, NY',
    salary: '$180k - $240k',
    salaryMin: 180,
    salaryMax: 240,
    type: 'Full-time',
    experienceLevel: 'Lead',
    description: 'Lead a team of 8 engineers building our core data infrastructure.',
    requirements: ['8+ years engineering', 'Architecture', 'Team leadership', 'Distributed systems'],
    skills: ['System design', 'Team leadership', 'AWS', 'Python'],
    postedAt: '6 days ago',
    applicants: 14,
  },
];

// Helper: calculate match score between user skills and job skills
export function calculateMatchScore(userSkills: string[], jobSkills: string[]): number {
  if (!jobSkills.length) return 0;
  const userSet = new Set(userSkills.map(s => s.toLowerCase()));
  const matched = jobSkills.filter(s => userSet.has(s.toLowerCase()));
  return Math.round((matched.length / jobSkills.length) * 100);
}

// Initial applications for demo
export const initialApplications: Application[] = [
  {
    id: 'a1',
    jobId: '1',
    job: jobs[0],
    appliedAt: '2 days ago',
    status: 'Shortlisted',
    statusHistory: [
      { status: 'Applied', date: '2 days ago' },
      { status: 'Shortlisted', date: '1 day ago' },
    ],
  },
  {
    id: 'a2',
    jobId: '4',
    job: jobs[3],
    appliedAt: '5 days ago',
    status: 'Interview',
    statusHistory: [
      { status: 'Applied', date: '5 days ago' },
      { status: 'Shortlisted', date: '3 days ago' },
      { status: 'Interview', date: '1 day ago' },
    ],
  },
  {
    id: 'a3',
    jobId: '2',
    job: jobs[1],
    appliedAt: '1 week ago',
    status: 'Rejected',
    statusHistory: [
      { status: 'Applied', date: '1 week ago' },
      { status: 'Rejected', date: '3 days ago' },
    ],
  },
];
