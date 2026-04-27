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

export type PostVisibility = 'public' | 'connections' | 'private';
export type AttachmentType = 'image' | 'video' | 'document';
export type ReactionType = 'like' | 'insightful' | 'celebrate' | 'support' | 'funny';

export interface PostAttachment {
  id: string;
  type: AttachmentType;
  url: string;
  title?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PollData {
  question: string;
  options: PollOption[];
}

export type ReactionCounts = Record<ReactionType, number>;

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  attachments?: PostAttachment[];
  poll?: PollData;
  reactions: ReactionCounts;
  userReaction?: ReactionType;
  comments: Comment[];
  shares: number;
  repostOfId?: string;
  visibility: PostVisibility;
  hashtags: string[];
  relevanceTags?: string[];
  scheduledFor?: string;
  createdAtISO: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  reactions?: Partial<ReactionCounts>;
  userReaction?: ReactionType;
  replies?: Comment[];
  createdAt: string;
}

export const reactionMeta: Record<ReactionType, { label: string; emoji: string }> = {
  like: { label: 'Like', emoji: '👍' },
  insightful: { label: 'Insightful', emoji: '💡' },
  celebrate: { label: 'Celebrate', emoji: '🎉' },
  support: { label: 'Support', emoji: '🤝' },
  funny: { label: 'Funny', emoji: '😂' },
};

export const createReactionCounts = (overrides?: Partial<ReactionCounts>): ReactionCounts => ({
  like: overrides?.like ?? 0,
  insightful: overrides?.insightful ?? 0,
  celebrate: overrides?.celebrate ?? 0,
  support: overrides?.support ?? 0,
  funny: overrides?.funny ?? 0,
});

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  remotePolicy: 'Onsite' | 'Hybrid' | 'Remote';
  industry: string;
  companySize: '1-50' | '51-200' | '201-1000' | '1000+';
  salary: string;
  salaryMin: number;
  salaryMax: number;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  description: string;
  requirements: string[];
  skills: string[];
  benefits: string[];
  visaSupport: boolean;
  urgentHiring: boolean;
  postedAt: string;
  postedAtISO: string;
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
    attachments: [
      { id: 'att-1', type: 'image', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop', title: 'Before/after dashboard revamp' },
      { id: 'att-2', type: 'document', url: 'https://example.com/design-case-study.pdf', title: 'Case study PDF' },
    ],
    reactions: createReactionCounts({ like: 84, insightful: 41, celebrate: 9, support: 5, funny: 3 }),
    userReaction: 'insightful',
    comments: [
      {
        id: 'c1',
        author: users[2],
        content: 'Amazing work Sarah! The new dashboard looks incredible.',
        createdAt: '2h ago',
        reactions: { celebrate: 3, like: 4 },
        replies: [
          {
            id: 'c1-r1',
            author: users[1],
            content: 'Thanks James! Happy to share the user interview framework.',
            createdAt: '90m ago',
            reactions: { support: 2 },
          },
        ],
      },
      {
        id: 'c2',
        author: users[3],
        content: 'Love the attention to detail here. Would love to chat about your research process.',
        createdAt: '1h ago',
        reactions: { insightful: 2 },
      },
    ],
    shares: 23,
    visibility: 'public',
    hashtags: ['#UXDesign', '#ProductDesign', '#DesignSystems'],
    relevanceTags: ['design systems', 'ux research', 'product thinking'],
    createdAtISO: '2026-04-27T09:20:00.000Z',
    createdAt: '3h ago',
  },
  {
    id: '2',
    author: users[2],
    content: 'We\'re hiring senior engineers at CloudScale! If you\'re passionate about distributed systems and want to work on problems at massive scale, DM me. Remote-friendly, great benefits, and an amazing team.',
    attachments: [
      { id: 'att-3', type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Engineering culture overview' },
    ],
    reactions: createReactionCounts({ like: 61, insightful: 11, celebrate: 7, support: 6, funny: 4 }),
    userReaction: 'like',
    comments: [
      {
        id: 'c3',
        author: users[0],
        content: 'This sounds exciting! Just sent you a message.',
        createdAt: '30m ago',
        reactions: { support: 2 },
        replies: [
          {
            id: 'c3-r1',
            author: users[2],
            content: 'Awesome, Alex. I\'ll reply with next steps today.',
            createdAt: '22m ago',
          },
        ],
      },
    ],
    shares: 45,
    visibility: 'connections',
    hashtags: ['#Hiring', '#DistributedSystems', '#RemoteJobs'],
    relevanceTags: ['react', 'node.js', 'system design', 'distributed systems'],
    createdAtISO: '2026-04-27T07:10:00.000Z',
    createdAt: '5h ago',
  },
  {
    id: '3',
    author: users[3],
    content: 'Hot take: The best code is the code you don\'t write. Spent the morning removing 2000 lines of legacy code and the system is now 3x faster. Sometimes less truly is more. 🧹✨',
    reactions: createReactionCounts({ like: 96, insightful: 112, celebrate: 13, support: 7, funny: 6 }),
    comments: [],
    shares: 67,
    visibility: 'public',
    hashtags: ['#SoftwareEngineering', '#Performance', '#Refactoring'],
    relevanceTags: ['system design', 'performance', 'code quality'],
    createdAtISO: '2026-04-27T04:15:00.000Z',
    createdAt: '8h ago',
  },
  {
    id: '4',
    author: users[4],
    content: 'Excited to announce our new mentorship program for early-career professionals! We\'re pairing experienced leaders with rising talent across all departments. Apply through the link in the comments.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
    attachments: [
      { id: 'att-4', type: 'image', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop', title: 'Mentorship kickoff event' },
      { id: 'att-5', type: 'document', url: 'https://example.com/mentorship-program-guide.pdf', title: 'Program guide' },
    ],
    poll: {
      question: 'What mentor format helps you most?',
      options: [
        { id: 'poll-1', text: '1:1 mentorship', votes: 42 },
        { id: 'poll-2', text: 'Group office hours', votes: 27 },
        { id: 'poll-3', text: 'Project-based mentorship', votes: 53 },
      ],
    },
    reactions: createReactionCounts({ like: 90, insightful: 33, celebrate: 41, support: 9, funny: 5 }),
    comments: [
      {
        id: 'c4',
        author: users[1],
        content: 'This is such a great initiative! Applied!',
        createdAt: '2h ago',
        reactions: { celebrate: 4 },
      },
    ],
    shares: 56,
    visibility: 'public',
    hashtags: ['#Mentorship', '#CareerGrowth', '#Leadership'],
    relevanceTags: ['career', 'growth', 'leadership'],
    createdAtISO: '2026-04-26T23:50:00.000Z',
    createdAt: '12h ago',
  },
];

export function extractHashtags(content: string): string[] {
  const matches = content.match(/#[\w-]+/g) ?? [];
  return Array.from(new Set(matches.map((tag) => tag.toLowerCase())));
}

export function totalReactions(reactions: ReactionCounts): number {
  return Object.values(reactions).reduce((sum, count) => sum + count, 0);
}

export function totalComments(comments: Comment[]): number {
  return comments.reduce((sum, comment) => sum + 1 + (comment.replies?.length ?? 0), 0);
}

function getRecencyScore(createdAtISO: string, now: number): number {
  const ageHours = Math.max(0, (now - new Date(createdAtISO).getTime()) / (1000 * 60 * 60));
  return Math.max(0, 100 - ageHours * 4.5);
}

function getRelevanceScore(post: Post, user: User): number {
  const normalizedTags = new Set([
    ...(post.relevanceTags ?? []).map((tag) => tag.toLowerCase()),
    ...post.hashtags.map((tag) => tag.replace('#', '').toLowerCase()),
  ]);

  const skillOverlap = (user.skills ?? []).filter((skill) => normalizedTags.has(skill.toLowerCase())).length;
  const roleBoost = post.author.role === user.role ? 8 : 0;

  return Math.min(100, skillOverlap * 18 + roleBoost);
}

export function getFeedRankScore(post: Post, user: User, now: number = Date.now()): number {
  const engagement = Math.min(100, totalReactions(post.reactions) + totalComments(post.comments) * 4 + post.shares * 3);
  const recency = getRecencyScore(post.createdAtISO, now);
  const relevance = getRelevanceScore(post, user);

  return engagement * 0.45 + recency * 0.35 + relevance * 0.2;
}

export function isPostVisibleToUser(post: Post, viewer: User): boolean {
  if (post.visibility === 'public') {
    return true;
  }

  if (post.visibility === 'private') {
    return post.author.id === viewer.id;
  }

  if (post.author.id === viewer.id) {
    return true;
  }

  return viewer.connections >= 50;
}

export function isScheduledAndNotDue(post: Post, now: number = Date.now()): boolean {
  if (!post.scheduledFor) {
    return false;
  }

  return new Date(post.scheduledFor).getTime() > now;
}

export function rankFeedPosts(feedPosts: Post[], viewer: User, now: number = Date.now()): Post[] {
  return [...feedPosts]
    .filter((post) => isPostVisibleToUser(post, viewer))
    .filter((post) => !isScheduledAndNotDue(post, now))
    .sort((a, b) => getFeedRankScore(b, viewer, now) - getFeedRankScore(a, viewer, now));
}

export function buildTrendingTopics(feedPosts: Post[]): { tag: string; posts: string }[] {
  const topicCounts = new Map<string, number>();

  feedPosts.forEach((post) => {
    const tags = post.hashtags.length ? post.hashtags : extractHashtags(post.content);
    tags.forEach((tag) => {
      const boost = 1 + Math.floor(totalReactions(post.reactions) / 60);
      topicCounts.set(tag, (topicCounts.get(tag) ?? 0) + boost);
    });
  });

  return [...topicCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag, count]) => ({ tag, posts: `${count.toLocaleString()} signals` }));
}

export const jobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'TechFlow Inc.',
    companyLogo: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=60&h=60&fit=crop',
    location: 'San Francisco, CA',
    remotePolicy: 'Hybrid',
    industry: 'SaaS',
    companySize: '201-1000',
    salary: '$150k - $200k',
    salaryMin: 150,
    salaryMax: 200,
    type: 'Full-time',
    experienceLevel: 'Senior',
    description: 'We\'re looking for a Senior Frontend Engineer to lead the development of our next-generation web platform.',
    requirements: ['5+ years React experience', 'TypeScript proficiency', 'System design skills', 'Team leadership'],
    skills: ['React', 'TypeScript', 'System design', 'Team leadership'],
    benefits: ['Stock options', 'Health insurance', 'Learning stipend'],
    visaSupport: true,
    urgentHiring: true,
    postedAt: '2 days ago',
    postedAtISO: '2026-04-25T10:00:00.000Z',
    applicants: 45,
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'DesignHub',
    companyLogo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=60&h=60&fit=crop',
    location: 'Remote',
    remotePolicy: 'Remote',
    industry: 'Design',
    companySize: '51-200',
    salary: '$120k - $160k',
    salaryMin: 120,
    salaryMax: 160,
    type: 'Remote',
    experienceLevel: 'Mid',
    description: 'Join our design team to create beautiful and intuitive experiences for millions of users worldwide.',
    requirements: ['3+ years product design', 'Figma expertise', 'User research', 'Design systems'],
    skills: ['Figma', 'User research', 'Design systems', 'Prototyping'],
    benefits: ['Remote stipend', 'Medical coverage', 'Annual offsite'],
    visaSupport: false,
    urgentHiring: false,
    postedAt: '1 day ago',
    postedAtISO: '2026-04-26T12:30:00.000Z',
    applicants: 32,
  },
  {
    id: '3',
    title: 'Data Engineer',
    company: 'DataVault',
    companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=60&h=60&fit=crop',
    location: 'New York, NY',
    remotePolicy: 'Onsite',
    industry: 'FinTech',
    companySize: '1000+',
    salary: '$140k - $180k',
    salaryMin: 140,
    salaryMax: 180,
    type: 'Full-time',
    experienceLevel: 'Senior',
    description: 'Build and maintain data pipelines that process billions of events daily.',
    requirements: ['Python/Scala', 'Apache Spark', 'AWS/GCP', 'SQL expertise'],
    skills: ['Python', 'SQL', 'Apache Spark', 'AWS'],
    benefits: ['Performance bonus', 'Commuter support', 'Retirement plan'],
    visaSupport: true,
    urgentHiring: false,
    postedAt: '3 days ago',
    postedAtISO: '2026-04-24T09:10:00.000Z',
    applicants: 28,
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'CloudScale',
    companyLogo: 'https://images.unsplash.com/photo-1568952433726-3896e3881c65?w=60&h=60&fit=crop',
    location: 'Austin, TX',
    remotePolicy: 'Hybrid',
    industry: 'Cloud Infrastructure',
    companySize: '201-1000',
    salary: '$130k - $170k',
    salaryMin: 130,
    salaryMax: 170,
    type: 'Full-time',
    experienceLevel: 'Mid',
    description: 'Help us scale our infrastructure to support the next million users.',
    requirements: ['Kubernetes', 'Terraform', 'CI/CD pipelines', 'Monitoring'],
    skills: ['Kubernetes', 'Terraform', 'CI/CD pipelines', 'AWS'],
    benefits: ['Home office stipend', 'Mental health support', 'Bonus'],
    visaSupport: false,
    urgentHiring: true,
    postedAt: '5 days ago',
    postedAtISO: '2026-04-22T15:45:00.000Z',
    applicants: 19,
  },
  {
    id: '5',
    title: 'Marketing Coordinator',
    company: 'PeopleFirst',
    companyLogo: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=60&h=60&fit=crop',
    location: 'Chicago, IL',
    remotePolicy: 'Onsite',
    industry: 'HR Tech',
    companySize: '51-200',
    salary: '$60k - $80k',
    salaryMin: 60,
    salaryMax: 80,
    type: 'Part-time',
    experienceLevel: 'Entry',
    description: 'Support our marketing team with campaign management and analytics.',
    requirements: ['Marketing degree', 'Social media', 'Analytics tools', 'Content creation'],
    skills: ['Social media', 'Analytics tools', 'Content creation', 'SEO'],
    benefits: ['Flexible schedule', 'Training budget'],
    visaSupport: false,
    urgentHiring: false,
    postedAt: '1 week ago',
    postedAtISO: '2026-04-20T11:30:00.000Z',
    applicants: 52,
  },
  {
    id: '6',
    title: 'Full Stack Developer',
    company: 'CloudScale',
    companyLogo: 'https://images.unsplash.com/photo-1568952433726-3896e3881c65?w=60&h=60&fit=crop',
    location: 'Remote',
    remotePolicy: 'Remote',
    industry: 'Cloud Infrastructure',
    companySize: '201-1000',
    salary: '$110k - $150k',
    salaryMin: 110,
    salaryMax: 150,
    type: 'Remote',
    experienceLevel: 'Mid',
    description: 'Build end-to-end features across our entire platform stack.',
    requirements: ['React', 'Node.js', 'PostgreSQL', 'REST APIs'],
    skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    benefits: ['Remote setup budget', 'Unlimited PTO', 'Stock options'],
    visaSupport: true,
    urgentHiring: true,
    postedAt: '4 days ago',
    postedAtISO: '2026-04-23T08:00:00.000Z',
    applicants: 37,
  },
  {
    id: '7',
    title: 'Junior React Developer',
    company: 'TechFlow Inc.',
    companyLogo: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=60&h=60&fit=crop',
    location: 'San Francisco, CA',
    remotePolicy: 'Onsite',
    industry: 'SaaS',
    companySize: '201-1000',
    salary: '$80k - $110k',
    salaryMin: 80,
    salaryMax: 110,
    type: 'Full-time',
    experienceLevel: 'Entry',
    description: 'Great opportunity for a motivated junior developer to grow with our frontend team.',
    requirements: ['React basics', 'JavaScript', 'CSS', 'Git'],
    skills: ['React', 'JavaScript', 'CSS'],
    benefits: ['Mentorship', 'Learning stipend', 'Health insurance'],
    visaSupport: false,
    urgentHiring: false,
    postedAt: '1 day ago',
    postedAtISO: '2026-04-26T09:20:00.000Z',
    applicants: 68,
  },
  {
    id: '8',
    title: 'Technical Lead',
    company: 'DataVault',
    companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=60&h=60&fit=crop',
    location: 'New York, NY',
    remotePolicy: 'Hybrid',
    industry: 'FinTech',
    companySize: '1000+',
    salary: '$180k - $240k',
    salaryMin: 180,
    salaryMax: 240,
    type: 'Full-time',
    experienceLevel: 'Lead',
    description: 'Lead a team of 8 engineers building our core data infrastructure.',
    requirements: ['8+ years engineering', 'Architecture', 'Team leadership', 'Distributed systems'],
    skills: ['System design', 'Team leadership', 'AWS', 'Python'],
    benefits: ['Executive coaching', 'Performance bonus', 'Equity'],
    visaSupport: true,
    urgentHiring: false,
    postedAt: '6 days ago',
    postedAtISO: '2026-04-21T14:00:00.000Z',
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

export function calculateSmartMatchScore(user: User, job: Job): number {
  const skillScore = calculateMatchScore(user.skills ?? [], job.skills);
  const experienceYears = user.experience ?? 0;
  const experienceBoost =
    (job.experienceLevel === 'Entry' && experienceYears >= 0) ||
    (job.experienceLevel === 'Mid' && experienceYears >= 2) ||
    (job.experienceLevel === 'Senior' && experienceYears >= 5) ||
    (job.experienceLevel === 'Lead' && experienceYears >= 8)
      ? 12
      : -8;

  const remoteBoost = job.remotePolicy === 'Remote' ? 8 : job.remotePolicy === 'Hybrid' ? 4 : 0;
  const companyFitBoost = user.role === 'seeker' ? 5 : 0;
  const urgencyBoost = job.urgentHiring ? 4 : 0;

  return Math.max(0, Math.min(100, skillScore * 0.7 + experienceBoost + remoteBoost + companyFitBoost + urgencyBoost));
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
