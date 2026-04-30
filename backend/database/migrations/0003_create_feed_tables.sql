-- Feed / Posts Tables
-- General-purpose social feed for all user roles (candidates, recruiters, admins)

-- Posts Table
CREATE TABLE IF NOT EXISTS posts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    content LONGTEXT NOT NULL,
    visibility ENUM('public', 'connections', 'private') NOT NULL DEFAULT 'public',
    hashtags JSON,                          -- Array of hashtag strings e.g. ["#react","#hiring"]
    relevance_tags JSON,                    -- Array of skill/topic strings for feed ranking
    scheduled_for TIMESTAMP NULL,           -- NULL = published immediately
    image_url VARCHAR(500),
    attachments JSON,                       -- Array of {id, type, url, title}
    poll JSON,                              -- {question, options:[{id,text,votes}]}
    repost_of_id CHAR(36) NULL,             -- FK to posts.id for reposts
    likes_count INT UNSIGNED DEFAULT 0,
    insightful_count INT UNSIGNED DEFAULT 0,
    celebrate_count INT UNSIGNED DEFAULT 0,
    support_count INT UNSIGNED DEFAULT 0,
    funny_count INT UNSIGNED DEFAULT 0,
    comments_count INT UNSIGNED DEFAULT 0,
    shares_count INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (repost_of_id) REFERENCES posts(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_visibility (visibility),
    INDEX idx_scheduled_for (scheduled_for),
    INDEX idx_created_at (created_at),
    FULLTEXT INDEX ft_content (content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Post Reactions Table (one row per user per post, reaction type can change)
CREATE TABLE IF NOT EXISTS post_reactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    post_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    reaction ENUM('like', 'insightful', 'celebrate', 'support', 'funny') NOT NULL DEFAULT 'like',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_post_reaction (post_id, user_id),
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Post Comments Table (supports nested replies via parent_id)
CREATE TABLE IF NOT EXISTS post_comments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    post_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    parent_id CHAR(36) NULL,               -- NULL = top-level comment, set = reply
    content TEXT NOT NULL,
    reactions JSON,                         -- {like:0, insightful:0, ...}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES post_comments(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
