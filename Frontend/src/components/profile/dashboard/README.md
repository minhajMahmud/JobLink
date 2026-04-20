# Profile Dashboard Components

A modern, production-grade profile dashboard system for a job portal. Built with React, TypeScript, Tailwind CSS, and Recharts.

## 📁 Directory Structure

```plaintext
Frontend/src/
├── components/profile/dashboard/
│   ├── ProfileDashboard.tsx          # Main dashboard container
│   ├── modules/
│   │   ├── SkillTagger.tsx           # Skill management module
│   │   ├── ProfileStrengthScore.tsx  # Profile completeness indicator
│   │   ├── JobRecommendations.tsx    # Personalized job matches
│   │   └── ProfileViewTracking.tsx   # Analytics & view tracking
│   └── components/
│       └── SkeletonLoader.tsx        # Loading state components
├── data/dashboard/
│   ├── mockData.ts                   # Mock data & interfaces
│   └── dashboardUtils.ts             # Utility functions
└── pages/
    └── DashboardPage.tsx             # Dashboard page route
```

## 🎯 Components

### 1. ProfileDashboard (Main Container)

The root component that orchestrates all dashboard modules.

**Features:**

- Responsive grid layout
- Modular component composition
- Easy data integration

**Usage:**

```tsx
import ProfileDashboard from "@/components/profile/dashboard/ProfileDashboard";

export default function DashboardPage() {
  return <ProfileDashboard loading={false} />;
}
```

**Props:**

- `loading?: boolean` - Show skeleton loaders while fetching data

---

### 2. SkillTagger Module

Comprehensive skill management system with trending skills and proficiency levels.

**Features:**

- ✅ Add/remove skills with proficiency levels (Beginner/Intermediate/Expert)
- ✅ Real-time autocomplete with trending skills
- ✅ Maximum 20 skills limit
- ✅ Skill deduplication
- ✅ Proficiency level management
- ✅ Error handling and validation
- ✅ Responsive design

**Usage:**

```tsx
import { SkillTagger } from "@/components/profile/dashboard/modules/SkillTagger";

export default function MyComponent() {
  return (
    <SkillTagger
      onSkillsChange={(skills) => console.log(skills)}
      loading={false}
    />
  );
}
```

**Props:**

- `onSkillsChange?: (skills: Skill[]) => void` - Callback when skills are updated
- `loading?: boolean` - Show loading state

**Data Structure:**

```ts
interface Skill {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Expert";
  endorsements?: number;
  endorsed: boolean;
}
```

---

### 3. ProfileStrengthScore Module

Circular progress indicator showing profile completeness with section breakdown.

**Features:**

- 🎯 Circular progress visualization (0-100%)
- 📋 Checklist of profile sections with weights
- 🎨 Color-coded strength levels (Strong/Good/Fair/Incomplete)
- 🎉 Completion celebration message
- 📊 Missing sections breakdown

**Usage:**

```tsx
import { ProfileStrengthScore } from "@/components/profile/dashboard/modules/ProfileStrengthScore";
import { MOCK_PROFILE_STRENGTH } from "@/data/dashboard/mockData";

export default function MyComponent() {
  return (
    <ProfileStrengthScore 
      items={MOCK_PROFILE_STRENGTH}
      loading={false}
    />
  );
}
```

**Props:**

- `items: ProfileStrengthItem[]` - Profile sections to track
- `loading?: boolean` - Show loading state

**Data Structure:**

```ts
interface ProfileStrengthItem {
  id: string;
  label: string;
  completed: boolean;
  weight: number; // Contribution to overall score
}
```

---

### 4. JobRecommendations Module

Personalized job matching with horizontal scroll layout.

**Features:**

- 💼 Job cards with match percentage (color-coded)
- ⭐ Save/unsave jobs with persistent state
- 📍 Location, salary, and level information
- 🎯 Match quality indicators (90%+, 75%+, 60%+)
- 💾 Bookmark functionality
- 📤 Share job button
- ⚡ Skeleton loaders while fetching

**Usage:**

```tsx
import { JobRecommendations } from "@/components/profile/dashboard/modules/JobRecommendations";
import { MOCK_JOB_RECOMMENDATIONS } from "@/data/dashboard/mockData";

export default function MyComponent() {
  return (
    <JobRecommendations
      jobs={MOCK_JOB_RECOMMENDATIONS}
      loading={false}
      onApply={(jobId) => console.log("Applied:", jobId)}
      onSave={(jobId) => console.log("Saved:", jobId)}
    />
  );
}
```

**Props:**

- `jobs?: Job[]` - Array of job recommendations
- `loading?: boolean` - Show loading state
- `onApply?: (jobId: string) => void` - Apply callback
- `onSave?: (jobId: string) => void` - Save callback

**Data Structure:**

```ts
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  level: "Entry" | "Mid" | "Senior" | "Lead";
  matchPercentage: number; // 0-100
  description: string;
  logo?: string;
  saved?: boolean;
}
```

---

### 5. ProfileViewTracking Module

Analytics dashboard with Recharts line chart and key metrics.

**Features:**

- 📊 Line chart visualization (7-day trend)
- 📈 Key metrics: total views, weekly growth, recruiter views
- 🎯 Growth trend indicator (% change)
- 💡 Actionable insights
- 🎨 Gradient cards for visual appeal

**Usage:**

```tsx
import { ProfileViewTracking } from "@/components/profile/dashboard/modules/ProfileViewTracking";
import { MOCK_PROFILE_METRICS } from "@/data/dashboard/mockData";

export default function MyComponent() {
  return (
    <ProfileViewTracking 
      metrics={MOCK_PROFILE_METRICS}
      loading={false}
    />
  );
}
```

**Props:**

- `metrics?: ProfileMetrics` - View tracking data
- `loading?: boolean` - Show loading state

**Data Structure:**

```ts
interface ProfileMetrics {
  totalViews: number;
  weeklyGrowth: number; // percentage
  recruiterViews: number;
  viewTrend: ViewData[]; // 7 items for weekly chart
}

interface ViewData {
  date: string;
  views: number;
}
```

---

### 6. SkeletonLoader Component

Reusable loading placeholders with multiple variants.

**Usage:**

```tsx
import { SkeletonCard, SkeletonCircular, SkeletonChip } from "@/components/profile/dashboard/components/SkeletonLoader";

export default function MyComponent() {
  return (
    <div>
      <SkeletonCard /> {/* Full card placeholder */}
      <SkeletonCircular /> {/* Circular progress placeholder */}
      <SkeletonChip /> {/* Tag/chip placeholder */}
    </div>
  );
}
```

---

## 📊 Mock Data

Mock data is provided for development and testing:

```tsx
import {
  MOCK_USER_SKILLS,
  MOCK_PROFILE_STRENGTH,
  MOCK_JOB_RECOMMENDATIONS,
  MOCK_PROFILE_METRICS,
  TRENDING_SKILLS,
  PROFICIENCY_LEVELS,
} from "@/data/dashboard/mockData";
```

---

## 🛠️ Utility Functions

Available in `dashboardUtils.ts`:

```tsx
import {
  calculateProfileStrength,    // Calculate score from items
  getMissingProfileSections,   // Get incomplete sections
  getProficiencyColor,         // Get Tailwind color for level
  getMatchColor,              // Get color based on match %
  getMatchBgColor,            // Get background color for match %
  formatNumber,               // Format large numbers (324 → 324k)
  getGrowthTrend,             // Get trend text and color
  debounce,                   // Debounce function
  filterSkills,               // Filter skills by search term
} from "@/data/dashboard/dashboardUtils";
```

---

## 🎨 Design System

### Colors & Styling

- **Proficiency Levels:**
  - Beginner: Blue (bg-blue-100, text-blue-800)
  - Intermediate: Amber (bg-amber-100, text-amber-800)
  - Expert: Emerald (bg-emerald-100, text-emerald-800)

- **Match Percentages:**
  - 90%+: Emerald (strong match)
  - 75%+: Blue (good match)
  - 60%+: Amber (fair match)
  - <60%: Slate (weak match)

### Responsive Breakpoints

- Mobile: Base classes
- Tablet: `sm:` prefix
- Desktop: `lg:` prefix

### Animations

- Smooth transitions (150ms-300ms)
- Hover states on interactive elements
- Pulse animations for loading states

---

## 🔌 API Integration

### Current State

Components currently use mock data from `mockData.ts`. To integrate with a real API:

1. **Replace mock data with API calls:**

```tsx
useEffect(() => {
  setLoading(true);
  // fetchUserSkills()
  //   .then(setSkills)
  //   .finally(() => setLoading(false));
}, []);
```

2. **Update callbacks:**

```tsx
const handleAddSkill = (skill: Skill) => {
  // saveSkillToAPI(skill)
  // setSkills([...skills, skill]);
};
```

3. **Expected API endpoints:**
   - `GET /api/user/skills` - Fetch user skills
   - `POST /api/user/skills` - Add skill
   - `DELETE /api/user/skills/:id` - Remove skill
   - `GET /api/profile/strength` - Profile completeness
   - `GET /api/jobs/recommendations` - Job recommendations
   - `GET /api/profile/views` - View metrics

---

## 📱 Responsive Design

All components are fully responsive:

- **Mobile:** Single column, scrollable lists
- **Tablet:** 2-column layouts where applicable
- **Desktop:** Full multi-column layouts

---

## ♿ Accessibility

Components include:

- ✅ ARIA labels on buttons and inputs
- ✅ Semantic HTML structure
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Color contrast compliance

---

## 🚀 Performance

- ✅ Memoized calculations with `useMemo`
- ✅ Optimized re-renders with `useCallback`
- ✅ Debounced search inputs
- ✅ Lazy-loaded Recharts chart
- ✅ Virtual scrolling ready for large lists

---

## 📦 Dependencies

- **react** - UI framework
- **recharts** - Data visualization
- **lucide-react** - Icons
- **tailwindcss** - Styling
- **typescript** - Type safety

---

## 🔒 Type Safety

Full TypeScript support with comprehensive interfaces:

- `Skill` - Skill definition
- `ProfileStrengthItem` - Profile section
- `Job` - Job listing
- `ProfileMetrics` - Analytics data

---

## 🎯 Next Steps

1. **Connect to backend API** - Replace mock data with real API calls
2. **Add persistent state** - Save skills, preferences to database
3. **Implement real-time updates** - WebSocket for view count updates
4. **Add more analytics** - Advanced filtering and export options
5. **Mobile optimization** - Fine-tune responsive behaviors

---

## 📝 Example: Full Dashboard Integration

```tsx
import React, { useState, useEffect } from "react";
import ProfileDashboard from "@/components/profile/dashboard/ProfileDashboard";

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate data loading
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <ProfileDashboard loading={loading} />
  );
}
```

---

## 📄 License

Part of JobLink - Modern Job Portal Platform

├── components/profile/dashboard/
│   ├── ProfileDashboard.tsx          # Main dashboard container
│   ├── modules/
│   │   ├── SkillTagger.tsx           # Skill management module
│   │   ├── ProfileStrengthScore.tsx  # Profile completeness indicator
│   │   ├── JobRecommendations.tsx    # Personalized job matches
│   │   └── ProfileViewTracking.tsx   # Analytics & view tracking
│   └── components/
│       └── SkeletonLoader.tsx        # Loading state components
├── data/dashboard/
│   ├── mockData.ts                   # Mock data & interfaces
│   └── dashboardUtils.ts             # Utility functions
└── pages/
    └── DashboardPage.tsx             # Dashboard page route
```

## 🎯 Components

### 1. ProfileDashboard (Main Container)
The root component that orchestrates all dashboard modules.

**Features:**
- Responsive grid layout
- Modular component composition
- Easy data integration

**Usage:**
```tsx
import ProfileDashboard from "@/components/profile/dashboard/ProfileDashboard";

export default function DashboardPage() {
  return <ProfileDashboard loading={false} />;
}
```

**Props:**
- `loading?: boolean` - Show skeleton loaders while fetching data

---

### 2. SkillTagger Module
Comprehensive skill management system with trending skills and proficiency levels.

**Features:**
- ✅ Add/remove skills with proficiency levels (Beginner/Intermediate/Expert)
- ✅ Real-time autocomplete with trending skills
- ✅ Maximum 20 skills limit
- ✅ Skill deduplication
- ✅ Proficiency level management
- ✅ Error handling and validation
- ✅ Responsive design

**Usage:**
```tsx
import { SkillTagger } from "@/components/profile/dashboard/modules/SkillTagger";

export default function MyComponent() {
  return (
    <SkillTagger
      onSkillsChange={(skills) => console.log(skills)}
      loading={false}
    />
  );
}
```

**Props:**
- `onSkillsChange?: (skills: Skill[]) => void` - Callback when skills are updated
- `loading?: boolean` - Show loading state

**Data Structure:**
```ts
interface Skill {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Expert";
  endorsements?: number;
  endorsed: boolean;
}
```

---

### 3. ProfileStrengthScore Module
Circular progress indicator showing profile completeness with section breakdown.

**Features:**
- 🎯 Circular progress visualization (0-100%)
- 📋 Checklist of profile sections with weights
- 🎨 Color-coded strength levels (Strong/Good/Fair/Incomplete)
- 🎉 Completion celebration message
- 📊 Missing sections breakdown

**Usage:**
```tsx
import { ProfileStrengthScore } from "@/components/profile/dashboard/modules/ProfileStrengthScore";
import { MOCK_PROFILE_STRENGTH } from "@/data/dashboard/mockData";

export default function MyComponent() {
  return (
    <ProfileStrengthScore 
      items={MOCK_PROFILE_STRENGTH}
      loading={false}
    />
  );
}
```

**Props:**
- `items: ProfileStrengthItem[]` - Profile sections to track
- `loading?: boolean` - Show loading state

**Data Structure:**
```ts
interface ProfileStrengthItem {
  id: string;
  label: string;
  completed: boolean;
  weight: number; // Contribution to overall score
}
```

---

### 4. JobRecommendations Module
Personalized job matching with horizontal scroll layout.

**Features:**
- 💼 Job cards with match percentage (color-coded)
- ⭐ Save/unsave jobs with persistent state
- 📍 Location, salary, and level information
- 🎯 Match quality indicators (90%+, 75%+, 60%+)
- 💾 Bookmark functionality
- 📤 Share job button
- ⚡ Skeleton loaders while fetching

**Usage:**
```tsx
import { JobRecommendations } from "@/components/profile/dashboard/modules/JobRecommendations";
import { MOCK_JOB_RECOMMENDATIONS } from "@/data/dashboard/mockData";

export default function MyComponent() {
  return (
    <JobRecommendations
      jobs={MOCK_JOB_RECOMMENDATIONS}
      loading={false}
      onApply={(jobId) => console.log("Applied:", jobId)}
      onSave={(jobId) => console.log("Saved:", jobId)}
    />
  );
}
```

**Props:**
- `jobs?: Job[]` - Array of job recommendations
- `loading?: boolean` - Show loading state
- `onApply?: (jobId: string) => void` - Apply callback
- `onSave?: (jobId: string) => void` - Save callback

**Data Structure:**
```ts
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  level: "Entry" | "Mid" | "Senior" | "Lead";
  matchPercentage: number; // 0-100
  description: string;
  logo?: string;
  saved?: boolean;
}
```

---

### 5. ProfileViewTracking Module
Analytics dashboard with Recharts line chart and key metrics.

**Features:**
- 📊 Line chart visualization (7-day trend)
- 📈 Key metrics: total views, weekly growth, recruiter views
- 🎯 Growth trend indicator (% change)
- 💡 Actionable insights
- 🎨 Gradient cards for visual appeal

**Usage:**
```tsx
import { ProfileViewTracking } from "@/components/profile/dashboard/modules/ProfileViewTracking";
import { MOCK_PROFILE_METRICS } from "@/data/dashboard/mockData";

export default function MyComponent() {
  return (
    <ProfileViewTracking 
      metrics={MOCK_PROFILE_METRICS}
      loading={false}
    />
  );
}
```

**Props:**
- `metrics?: ProfileMetrics` - View tracking data
- `loading?: boolean` - Show loading state

**Data Structure:**
```ts
interface ProfileMetrics {
  totalViews: number;
  weeklyGrowth: number; // percentage
  recruiterViews: number;
  viewTrend: ViewData[]; // 7 items for weekly chart
}

interface ViewData {
  date: string;
  views: number;
}
```

---

### 6. SkeletonLoader Component
Reusable loading placeholders with multiple variants.

**Usage:**
```tsx
import { SkeletonCard, SkeletonCircular, SkeletonChip } from "@/components/profile/dashboard/components/SkeletonLoader";

export default function MyComponent() {
  return (
    <div>
      <SkeletonCard /> {/* Full card placeholder */}
      <SkeletonCircular /> {/* Circular progress placeholder */}
      <SkeletonChip /> {/* Tag/chip placeholder */}
    </div>
  );
}
```

---

## 📊 Mock Data

Mock data is provided for development and testing:

```tsx
import {
  MOCK_USER_SKILLS,
  MOCK_PROFILE_STRENGTH,
  MOCK_JOB_RECOMMENDATIONS,
  MOCK_PROFILE_METRICS,
  TRENDING_SKILLS,
  PROFICIENCY_LEVELS,
} from "@/data/dashboard/mockData";
```

---

## 🛠️ Utility Functions

Available in `dashboardUtils.ts`:

```tsx
import {
  calculateProfileStrength,    // Calculate score from items
  getMissingProfileSections,   // Get incomplete sections
  getProficiencyColor,         // Get Tailwind color for level
  getMatchColor,              // Get color based on match %
  getMatchBgColor,            // Get background color for match %
  formatNumber,               // Format large numbers (324 → 324k)
  getGrowthTrend,             // Get trend text and color
  debounce,                   // Debounce function
  filterSkills,               // Filter skills by search term
} from "@/data/dashboard/dashboardUtils";
```

---

## 🎨 Design System

### Colors & Styling
- **Proficiency Levels:**
  - Beginner: Blue (bg-blue-100, text-blue-800)
  - Intermediate: Amber (bg-amber-100, text-amber-800)
  - Expert: Emerald (bg-emerald-100, text-emerald-800)

- **Match Percentages:**
  - 90%+: Emerald (strong match)
  - 75%+: Blue (good match)
  - 60%+: Amber (fair match)
  - <60%: Slate (weak match)

### Responsive Breakpoints
- Mobile: Base classes
- Tablet: `sm:` prefix
- Desktop: `lg:` prefix

### Animations
- Smooth transitions (150ms-300ms)
- Hover states on interactive elements
- Pulse animations for loading states

---

## 🔌 API Integration

### Current State
Components currently use mock data from `mockData.ts`. To integrate with a real API:

1. **Replace mock data with API calls:**
```tsx
useEffect(() => {
  setLoading(true);
  // fetchUserSkills()
  //   .then(setSkills)
  //   .finally(() => setLoading(false));
}, []);
```

2. **Update callbacks:**
```tsx
const handleAddSkill = (skill: Skill) => {
  // saveSkillToAPI(skill)
  // setSkills([...skills, skill]);
};
```

3. **Expected API endpoints:**
   - `GET /api/user/skills` - Fetch user skills
   - `POST /api/user/skills` - Add skill
   - `DELETE /api/user/skills/:id` - Remove skill
   - `GET /api/profile/strength` - Profile completeness
   - `GET /api/jobs/recommendations` - Job recommendations
   - `GET /api/profile/views` - View metrics

---

## 📱 Responsive Design

All components are fully responsive:
- **Mobile:** Single column, scrollable lists
- **Tablet:** 2-column layouts where applicable
- **Desktop:** Full multi-column layouts

---

## ♿ Accessibility

Components include:
- ✅ ARIA labels on buttons and inputs
- ✅ Semantic HTML structure
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Color contrast compliance

---

## 🚀 Performance

- ✅ Memoized calculations with `useMemo`
- ✅ Optimized re-renders with `useCallback`
- ✅ Debounced search inputs
- ✅ Lazy-loaded Recharts chart
- ✅ Virtual scrolling ready for large lists

---

## 📦 Dependencies

- **react** - UI framework
- **recharts** - Data visualization
- **lucide-react** - Icons
- **tailwindcss** - Styling
- **typescript** - Type safety

---

## 🔒 Type Safety

Full TypeScript support with comprehensive interfaces:
- `Skill` - Skill definition
- `ProfileStrengthItem` - Profile section
- `Job` - Job listing
- `ProfileMetrics` - Analytics data

---

## 🎯 Next Steps

1. **Connect to backend API** - Replace mock data with real API calls
2. **Add persistent state** - Save skills, preferences to database
3. **Implement real-time updates** - WebSocket for view count updates
4. **Add more analytics** - Advanced filtering and export options
5. **Mobile optimization** - Fine-tune responsive behaviors

---

## 📝 Example: Full Dashboard Integration

```tsx
import React, { useState, useEffect } from "react";
import ProfileDashboard from "@/components/profile/dashboard/ProfileDashboard";

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate data loading
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <ProfileDashboard loading={loading} />
  );
}
```

---

## 📄 License

Part of JobLink - Modern Job Portal Platform
