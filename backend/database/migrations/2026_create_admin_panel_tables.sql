-- Admin Panel schema for governance, moderation, analytics, and RBAC

CREATE TABLE IF NOT EXISTS admin_roles (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_permissions (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  label VARCHAR(150) NOT NULL,
  module VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_role_permissions (
  id CHAR(36) PRIMARY KEY,
  role_id CHAR(36) NOT NULL,
  permission_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_admin_role_permission (role_id, permission_id),
  CONSTRAINT fk_arp_role FOREIGN KEY (role_id) REFERENCES admin_roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_arp_permission FOREIGN KEY (permission_id) REFERENCES admin_permissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_user_roles (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  role_id CHAR(36) NOT NULL,
  assigned_by CHAR(36) NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_admin_user_role (user_id, role_id),
  CONSTRAINT fk_aur_role FOREIGN KEY (role_id) REFERENCES admin_roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS moderation_posts (
  id CHAR(36) PRIMARY KEY,
  post_id CHAR(36) NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected', 'Removed') NOT NULL DEFAULT 'Pending',
  spam_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  risk_level ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Low',
  flagged_keywords JSON NULL,
  moderation_note TEXT NULL,
  moderated_by CHAR(36) NULL,
  moderated_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_moderation_posts_status (status),
  INDEX idx_moderation_posts_risk (risk_level)
);

CREATE TABLE IF NOT EXISTS moderation_jobs (
  id CHAR(36) PRIMARY KEY,
  job_id CHAR(36) NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected', 'Removed') NOT NULL DEFAULT 'Pending',
  spam_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  risk_level ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Low',
  moderation_note TEXT NULL,
  moderated_by CHAR(36) NULL,
  moderated_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_moderation_jobs_status (status),
  INDEX idx_moderation_jobs_risk (risk_level)
);

CREATE TABLE IF NOT EXISTS admin_reports (
  id CHAR(36) PRIMARY KEY,
  category ENUM('spam', 'abuse', 'fake_job', 'harassment', 'other') NOT NULL,
  entity_type ENUM('post', 'job', 'user', 'comment') NOT NULL,
  entity_id CHAR(36) NOT NULL,
  reporter_user_id CHAR(36) NULL,
  details TEXT NOT NULL,
  priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
  status ENUM('Open', 'Investigating', 'Resolved', 'Dismissed') NOT NULL DEFAULT 'Open',
  assigned_to CHAR(36) NULL,
  admin_notes TEXT NULL,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admin_reports_status_priority (status, priority),
  INDEX idx_admin_reports_entity (entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS spam_events (
  id CHAR(36) PRIMARY KEY,
  entity_type ENUM('post', 'job', 'user') NOT NULL,
  entity_id CHAR(36) NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  risk_level ENUM('Low', 'Medium', 'High') NOT NULL,
  reason_codes JSON NOT NULL,
  detector ENUM('rule_based', 'ml_based', 'hybrid') NOT NULL DEFAULT 'hybrid',
  is_auto_flagged TINYINT(1) NOT NULL DEFAULT 1,
  reviewed_by CHAR(36) NULL,
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_spam_events_entity (entity_type, entity_id),
  INDEX idx_spam_events_risk (risk_level),
  INDEX idx_spam_events_created (created_at)
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id CHAR(36) PRIMARY KEY,
  actor_user_id CHAR(36) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  action_code VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(50) NULL,
  payload JSON NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_audit_actor (actor_user_id, created_at),
  INDEX idx_admin_audit_action (action_code, created_at)
);
