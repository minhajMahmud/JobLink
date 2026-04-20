<?php

// routes/recruiter.php - Recruitment Management System Routes

return [
    // Candidate Filtering & Search Routes
    'prefix' => '/recruiter',
    'middleware' => ['auth', 'role:recruiter,admin'],
    'routes' => [
        // Candidates
        ['GET', '/candidates/search', 'CandidateController@search'],
        ['GET', '/candidates/trending-skills', 'CandidateController@getTrendingSkills'],
        ['GET', '/candidates/{id}', 'CandidateController@show'],
        ['POST', '/candidates/batch', 'CandidateController@batch'],
        ['GET', '/candidates/{id}/match-score/{jobId}', 'CandidateController@getMatchScore'],
        ['GET', '/candidates/job/{jobId}', 'CandidateController@getCandidatesForJob'],

        // Saved Candidate Searches
        ['POST', '/candidates/saved-searches', 'CandidateController@saveCandidateSearch'],
        ['GET', '/candidates/saved-searches', 'CandidateController@getSavedSearches'],
        ['DELETE', '/candidates/saved-searches/{id}', 'CandidateController@deleteSavedSearch'],
        ['GET', '/candidates/saved-searches/{id}/apply', 'CandidateController@applySavedSearch'],

        // Interview Scheduling
        ['POST', '/interviews/schedule', 'InterviewController@schedule'],
        ['GET', '/interviews/{id}', 'InterviewController@show'],
        ['GET', '/interviews/my-interviews', 'InterviewController@getMyInterviews'],
        ['GET', '/interviews/candidate/{candidateId}', 'InterviewController@getCandidateInterviews'],
        ['GET', '/interviews/job/{jobId}', 'InterviewController@getJobInterviews'],
        ['PUT', '/interviews/{id}', 'InterviewController@update'],
        ['POST', '/interviews/{id}/cancel', 'InterviewController@cancel'],
        ['POST', '/interviews/{id}/complete', 'InterviewController@complete'],
        ['POST', '/interviews/{id}/reschedule', 'InterviewController@reschedule'],
        ['GET', '/interviews/availability', 'InterviewController@getAvailability'],
        ['POST', '/interviews/availability', 'InterviewController@setAvailability'],
        ['GET', '/interviews/available-slots', 'InterviewController@getAvailableSlots'],
        ['GET', '/interviews/check-conflict', 'InterviewController@checkConflict'],
        ['POST', '/interviews/{id}/send-invitation', 'InterviewController@sendInvitation'],
        ['GET', '/interviews/stats', 'InterviewController@getInterviewStats'],
        ['POST', '/interviews/generate-meeting-link', 'InterviewController@generateMeetingLink'],

        // Job Promotions
        ['POST', '/promotions/create', 'JobPromotionController@promote'],
        ['GET', '/promotions/{id}', 'JobPromotionController@show'],
        ['GET', '/promotions/my-promotions', 'JobPromotionController@getMyPromotions'],
        ['GET', '/promotions/active', 'JobPromotionController@getActivePromotions'],
        ['PUT', '/promotions/{id}/duration', 'JobPromotionController@updateDuration'],
        ['POST', '/promotions/{id}/cancel', 'JobPromotionController@cancel'],
        ['GET', '/promotions/{id}/stats', 'JobPromotionController@getStats'],
        ['GET', '/promotions/{id}/analytics', 'JobPromotionController@getDailyAnalytics'],
        ['GET', '/promotions/pricing', 'JobPromotionController@getPricingTiers'],
        ['POST', '/promotions/{id}/payment', 'JobPromotionController@processPayment'],
        ['GET', '/promotions/{id}/roi', 'JobPromotionController@getROI'],

        // Company Posts & Engagement Feed
        ['POST', '/posts/create', 'CompanyPostController@create'],
        ['GET', '/posts/{id}', 'CompanyPostController@show'],
        ['GET', '/posts/company/{companyId}', 'CompanyPostController@getCompanyFeed'],
        ['GET', '/posts/my-posts', 'CompanyPostController@getMyPosts'],
        ['PUT', '/posts/{id}', 'CompanyPostController@update'],
        ['DELETE', '/posts/{id}', 'CompanyPostController@delete'],
        ['POST', '/posts/{id}/like', 'CompanyPostController@toggleLike'],
        ['POST', '/posts/{id}/comment', 'CompanyPostController@addComment'],
        ['GET', '/posts/{id}/comments', 'CompanyPostController@getComments'],
        ['DELETE', '/posts/{id}/comment/{commentId}', 'CompanyPostController@deleteComment'],
        ['POST', '/posts/{id}/share', 'CompanyPostController@share'],
        ['POST', '/posts/{id}/promote', 'CompanyPostController@promote'],
        ['GET', '/posts/{id}/analytics', 'CompanyPostController@getAnalytics'],
        ['GET', '/posts/trending', 'CompanyPostController@getTrendingPosts'],
        ['GET', '/posts/search', 'CompanyPostController@search'],

        // Dashboard
        ['GET', '/dashboard', 'RecruiterDashboardController@getDashboard'],
        ['GET', '/dashboard/pipeline', 'RecruiterDashboardController@getPipelineStats'],
        ['GET', '/dashboard/analytics', 'RecruiterDashboardController@getAnalytics'],
    ]
];

/**
 * API Response Structure:
 * {
 *     "data": { ... },
 *     "meta": {
 *         "page": 1,
 *         "limit": 20,
 *         "total": 100,
 *         "total_pages": 5
 *     },
 *     "status": 200,
 *     "timestamp": "2025-04-20T12:00:00Z"
 * }
 *
 * Error Response:
 * {
 *     "error": "Error message",
 *     "status": 400,
 *     "timestamp": "2025-04-20T12:00:00Z"
 * }
 */
