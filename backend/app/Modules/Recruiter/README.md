# Recruitment Management System (RMS)

A production-grade, enterprise-scale Recruitment Management System built with React + TypeScript (Frontend) and PHP (Backend). Designed to help recruiters and employers streamline hiring workflows with advanced candidate filtering, interview scheduling, job promotion, and engagement tracking.

## 🎯 Core Modules

### 1. **Candidate Filtering & Search System**
Advanced multi-dimensional search and filtering for candidate discovery.

**Features:**
- Full-text search with Boolean logic
- Multi-field filtering (skills, experience, education, location, availability, salary)
- Skill extraction and trending analysis
- Candidate match scoring against job requirements
- Saved search presets for quick access
- Batch candidate retrieval for bulk operations

**Frontend Components:**
- `CandidateFilterPanel.tsx` - Advanced filter UI with real-time updates
- `CandidateSearchResults.tsx` - Results display with pagination & actions

**Backend APIs:**
- `GET /api/recruiter/candidates/search` - Search with filters
- `GET /api/recruiter/candidates/{id}` - Single candidate profile
- `POST /api/recruiter/candidates/batch` - Batch retrieval
- `GET /api/recruiter/candidates/{id}/match-score/{jobId}` - AI match scoring
- `GET /api/recruiter/candidates/trending-skills` - Skills autocomplete
- `POST /api/recruiter/candidates/saved-searches` - Save search preset

**Database:**
- `candidates` table (UUID PK, skills JSON, experience, education, location, salary)
- `saved_candidate_searches` table (save filter presets)
- FULLTEXT indexes on bio and skills for fast text search

---

### 2. **Interview Scheduling & Coordination**
Frictionless interview lifecycle management with conflict detection.

**Features:**
- Calendar-based time slot selection
- Recruiter availability management
- Multi-round interview support (Screening → Technical → HR → Final)
- Multiple interview formats (Virtual, In-Person, Phone, Technical)
- Automatic conflict detection
- Meeting link generation (Zoom, Google Meet)
- Timezone support
- Interview feedback & rating system
- Pipeline analytics

**Frontend Components:**
- `InterviewScheduler.tsx` - Multi-step scheduling modal with time slot picker

**Backend APIs:**
- `POST /api/recruiter/interviews/schedule` - Schedule new interview
- `GET /api/recruiter/interviews/{id}` - Get interview details
- `GET /api/recruiter/interviews/my-interviews` - List recruiter interviews
- `GET /api/recruiter/interviews/candidate/{candidateId}` - Candidate's interviews
- `PUT /api/recruiter/interviews/{id}` - Update interview
- `POST /api/recruiter/interviews/{id}/cancel` - Cancel interview
- `POST /api/recruiter/interviews/{id}/complete` - Complete interview (with feedback)
- `POST /api/recruiter/interviews/{id}/reschedule` - Reschedule interview
- `GET /api/recruiter/interviews/availability` - Get recruiter availability
- `GET /api/recruiter/interviews/available-slots` - Get available time slots
- `GET /api/recruiter/interviews/check-conflict` - Conflict detection
- `POST /api/recruiter/interviews/{id}/send-invitation` - Send email to candidate

**Database:**
- `interviews` table (UUID PK, type/round/status ENUMs, timezone, meet_link)
- `recruiter_availability` table (availability blocks with time constraints)
- Unique composite key (recruiter_id, scheduled_at, duration_minutes) prevents double-booking

---

### 3. **Featured Job Promotion Engine**
Boost job visibility and drive application rates with strategic promotion.

**Features:**
- Mark jobs as featured with flexible duration (7/15/30 days)
- Priority placement in search results
- Real-time performance analytics (views, clicks, applications)
- Daily performance tracking
- ROI calculation and insights
- Payment processing (card, PayPal, invoice)
- Promotion status management

**Backend APIs:**
- `POST /api/recruiter/promotions/create` - Create job promotion
- `GET /api/recruiter/promotions/{id}` - Get promotion details
- `GET /api/recruiter/promotions/my-promotions` - List recruiter promotions
- `GET /api/recruiter/promotions/active` - Get active promotions
- `PUT /api/recruiter/promotions/{id}/duration` - Extend promotion
- `POST /api/recruiter/promotions/{id}/cancel` - Cancel promotion
- `GET /api/recruiter/promotions/{id}/stats` - Get promotion stats
- `GET /api/recruiter/promotions/{id}/analytics` - Daily analytics
- `GET /api/recruiter/promotions/pricing` - Pricing tiers
- `POST /api/recruiter/promotions/{id}/payment` - Process payment
- `GET /api/recruiter/promotions/{id}/roi` - ROI calculation

**Database:**
- `job_promotions` table (duration CHECK constraint, is_active flag, views/clicks/applications counters)
- `promotion_analytics` table (daily performance data with date range queries)

---

### 4. **Company Posts & Engagement Feed**
Build employer brand and engage candidates with content marketing.

**Features:**
- Create rich-text posts with media (images/videos)
- Engagement actions (like, comment, share)
- Comment threading
- Trending posts discovery
- Post search functionality
- Engagement analytics (reach, impressions, engagement rate)
- Post promotion for increased reach (paid)
- Delete/edit capabilities

**Backend APIs:**
- `POST /api/recruiter/posts/create` - Create new post
- `GET /api/recruiter/posts/{id}` - Get post details
- `GET /api/recruiter/posts/company/{companyId}` - Get company feed
- `GET /api/recruiter/posts/my-posts` - Get recruiter's posts
- `PUT /api/recruiter/posts/{id}` - Update post
- `DELETE /api/recruiter/posts/{id}` - Delete post
- `POST /api/recruiter/posts/{id}/like` - Like/unlike
- `POST /api/recruiter/posts/{id}/comment` - Add comment
- `GET /api/recruiter/posts/{id}/comments` - Get comments
- `DELETE /api/recruiter/posts/{id}/comment/{commentId}` - Delete comment
- `POST /api/recruiter/posts/{id}/share` - Share post
- `POST /api/recruiter/posts/{id}/promote` - Promote post (paid)
- `GET /api/recruiter/posts/{id}/analytics` - Post analytics
- `GET /api/recruiter/posts/trending` - Trending posts
- `GET /api/recruiter/posts/search` - Search posts

**Database:**
- `company_posts` table (content, recruiter_id, engagement counters)
- `post_media` table (media files associated with posts)
- `post_engagements` table (likes, comments, shares with unique composite key)
- FULLTEXT index on post content

---

## 📁 Project Structure

```
JobLink/
├── Frontend/
│   └── src/
│       └── modules/
│           └── recruiter/
│               ├── components/
│               │   ├── candidate-search/
│               │   │   ├── CandidateFilterPanel.tsx
│               │   │   └── CandidateSearchResults.tsx
│               │   ├── interview-scheduler/
│               │   │   └── InterviewScheduler.tsx
│               │   ├── job-promotions/
│               │   │   └── JobPromotionPanel.tsx
│               │   ├── company-posts/
│               │   │   ├── CompanyPostsFeed.tsx
│               │   │   └── CreatePostModal.tsx
│               │   └── layout/
│               │       └── RecruiterDashboard.tsx
│               ├── services/
│               │   ├── candidateSearchService.ts
│               │   ├── interviewSchedulingService.ts
│               │   └── jobPromotionService.ts
│               ├── types/
│               │   └── index.ts
│               ├── data/
│               │   └── mockData.ts
│               └── hooks/
│
└── backend/
    └── app/
        └── Modules/
            └── Recruiter/
                ├── Controllers/
                │   ├── CandidateController.php
                │   ├── InterviewController.php
                │   ├── JobPromotionController.php
                │   ├── CompanyPostController.php
                │   └── RecruiterDashboardController.php
                ├── Models/
                │   ├── Candidate.php
                │   ├── Interview.php
                │   ├── JobPromotion.php
                │   └── CompanyPost.php
                ├── Repositories/
                │   ├── CandidateRepository.php
                │   ├── InterviewRepository.php
                │   ├── PromotionRepository.php
                │   └── PostRepository.php
                ├── Services/
                │   ├── CandidateSearchService.php
                │   ├── InterviewSchedulingService.php
                │   ├── JobPromotionService.php
                │   └── CompanyPostService.php
                ├── Routes/
                │   └── api.php
                └── database/
                    └── migrations/
                        └── 2025_create_rms_tables.sql
```

---

## 🗄️ Database Schema

### Core Tables

**candidates**
- `id` (UUID PK)
- `user_id` (FK to users)
- `skills` (JSON array)
- `experience_years` (INT)
- `education_level` (ENUM)
- `location` (VARCHAR)
- `availability_status` (ENUM: Available, Passive, Not Interested)
- `salary_expectation_min`, `salary_expectation_max` (INT)
- `bio` (TEXT with FULLTEXT index)
- `avatar_url` (VARCHAR)
- `created_at`, `updated_at` (TIMESTAMP)

**interviews**
- `id` (UUID PK)
- `recruiter_id` (FK)
- `job_id` (FK)
- `candidate_id` (FK to candidates)
- `type` (ENUM: Virtual, In-Person, Phone, Technical)
- `round` (ENUM: Screening, Technical, HR, Final)
- `status` (ENUM: Scheduled, Completed, Cancelled, Rescheduled)
- `scheduled_at` (DATETIME)
- `duration_minutes` (INT)
- `timezone` (VARCHAR)
- `location` (VARCHAR - for in-person)
- `meet_link` (VARCHAR - for virtual)
- `agenda` (TEXT)
- `feedback_notes` (TEXT)
- `rating` (INT 1-5)
- `unique` constraint on (recruiter_id, scheduled_at, duration_minutes)

**job_promotions**
- `id` (UUID PK)
- `job_id` (FK)
- `recruiter_id` (FK)
- `company_id` (FK)
- `duration_days` (INT CHECK IN (7, 15, 30))
- `is_active` (BOOLEAN)
- `views` (INT)
- `clicks` (INT)
- `applications` (INT)
- `status` (ENUM: Pending, Active, Expired, Cancelled)
- `payment_status` (ENUM: Pending, Completed, Failed)
- `amount_paid` (DECIMAL)
- `created_at`, `updated_at` (TIMESTAMP)

**company_posts**
- `id` (UUID PK)
- `recruiter_id` (FK)
- `company_id` (FK)
- `content` (LONGTEXT with FULLTEXT index)
- `type` (ENUM: Job Update, Culture, Achievement, Event)
- `likes_count` (INT)
- `comments_count` (INT)
- `shares_count` (INT)
- `created_at`, `updated_at` (TIMESTAMP)

**post_media**
- `id` (UUID PK)
- `post_id` (FK to company_posts)
- `media_url` (VARCHAR)
- `media_type` (ENUM: Image, Video)

**post_engagements**
- `id` (UUID PK)
- `post_id` (FK)
- `user_id` (FK)
- `type` (ENUM: Like, Comment, Share)
- `content` (TEXT - for comments)
- `unique` constraint on (post_id, user_id, type)

**saved_candidate_searches**
- `id` (UUID PK)
- `recruiter_id` (FK)
- `name` (VARCHAR)
- `filters` (JSON)
- `created_at` (TIMESTAMP)

**recruiter_availability**
- `id` (UUID PK)
- `recruiter_id` (FK)
- `start_time` (DATETIME)
- `end_time` (DATETIME)
- `is_available` (BOOLEAN)

**promotion_analytics**
- `id` (UUID PK)
- `promotion_id` (FK)
- `date` (DATE)
- `views` (INT)
- `clicks` (INT)
- `applications` (INT)
- `index` on date for time-series queries

---

## 🚀 API Authentication

All APIs require Bearer token authentication:

```
Authorization: Bearer {jwt_token}
```

Middleware stack:
1. `auth` - Verify JWT token
2. `role:recruiter,admin` - Check user role

---

## 📊 Data Models (TypeScript)

### Candidate
```typescript
interface Candidate {
  id: string;
  user_id: string;
  skills: string[];
  experience_years: number;
  education_level: string;
  location: string;
  availability_status: 'Available' | 'Passive' | 'Not Interested';
  salary_expectation_min: number;
  salary_expectation_max: number;
  bio: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
```

### Interview
```typescript
interface Interview {
  id: string;
  recruiter_id: string;
  candidate_id: string;
  job_id: string;
  type: InterviewType;
  round: InterviewRound;
  status: InterviewStatus;
  scheduled_at: string;
  duration_minutes: number;
  timezone: string;
  location?: string;
  meet_link?: string;
  agenda: string;
  feedback_notes?: string;
  rating?: number;
}
```

### JobPromotion
```typescript
interface JobPromotion {
  id: string;
  job_id: string;
  recruiter_id: string;
  company_id: string;
  duration_days: 7 | 15 | 30;
  is_active: boolean;
  views: number;
  clicks: number;
  applications: number;
  status: 'Pending' | 'Active' | 'Expired' | 'Cancelled';
  payment_status: 'Pending' | 'Completed' | 'Failed';
  amount_paid: number;
}
```

### CompanyPost
```typescript
interface CompanyPost {
  id: string;
  recruiter_id: string;
  company_id: string;
  content: string;
  type: 'Job Update' | 'Culture' | 'Achievement' | 'Event';
  media?: PostMedia[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
}
```

---

## 🛠️ Development Setup

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
composer install
php bootstrap/app.php migrate
php -S localhost:8000 public/index.php
```

### Database
```bash
mysql -u root -p < backend/database/migrations/2025_create_rms_tables.sql
```

---

## 🔄 API Response Format

Success Response (200-201):
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  },
  "status": 200,
  "timestamp": "2025-04-20T12:00:00Z"
}
```

Error Response:
```json
{
  "error": "Detailed error message",
  "status": 400,
  "timestamp": "2025-04-20T12:00:00Z"
}
```

---

## 📝 Implementation Checklist

- [x] Database schema design
- [x] TypeScript type definitions
- [x] Frontend service layer (Axios clients)
- [x] Candidate Filter Panel component
- [x] Candidate Search Results component
- [x] Interview Scheduler modal
- [x] Backend routing structure
- [x] CandidateController implementation
- [ ] InterviewController implementation
- [ ] JobPromotionController implementation
- [ ] CompanyPostController implementation
- [ ] Database Models & Repositories
- [ ] Business Logic Services
- [ ] Email notification system
- [ ] Payment gateway integration (Stripe)
- [ ] WebSocket real-time updates
- [ ] Full-text search optimization
- [ ] Analytics dashboard
- [ ] Admin moderation tools
- [ ] API rate limiting
- [ ] Comprehensive API documentation
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Deployment & DevOps setup

---

## 🎨 Component Library

All components built with Tailwind CSS and Lucide Icons for consistent enterprise-grade UI.

**Core Components:**
- Button (primary, secondary, danger)
- Input (text, number, date, email)
- Select (single, multi)
- Modal/Dialog
- Card
- Badge
- Pagination
- Loading Spinner
- Toast Notifications
- Empty State

---

## 📚 References

- React 18 Documentation: https://react.dev
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Tailwind CSS: https://tailwindcss.com
- Axios API Client: https://axios-http.com
- Laravel (PHP Backend): https://laravel.com

---

## 📄 License

MIT License - Feel free to use this system in your projects.
