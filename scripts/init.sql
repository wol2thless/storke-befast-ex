-- ============================================================
-- Stroke BEFAST Application — Database Initialization Script
-- ============================================================
-- วิธีใช้ (MAMP):
--   /Applications/MAMP/Library/bin/mysql80/bin/mysql -u root -p < scripts/init.sql
--
-- Default admin account:
--   Username (provider_id): admin
--   Password: Admin1234
-- ============================================================

CREATE DATABASE IF NOT EXISTS `stroke`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `stroke`;

-- ------------------------------------------------
-- stk_admin_users (ต้องสร้างก่อน stk_admin_sessions)
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS `stk_admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `provider_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','staff','supervisor') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'staff',
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `provider_id` (`provider_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default admin user (password: Admin1234)
INSERT IGNORE INTO `stk_admin_users`
  (`provider_id`, `name`, `role`, `password_hash`, `is_active`)
VALUES
  ('admin', 'ผู้ดูแลระบบ', 'admin',
   '$2b$10$QFA/tjf59YkUYbEMGdbptODzUM6q5NewLDEfwZd3BTnkfzKnrFUgu', 1);

-- ------------------------------------------------
-- stk_admin_sessions
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS `stk_admin_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) NOT NULL,
  `token` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  UNIQUE KEY `admin_id` (`admin_id`),
  KEY `expires_at` (`expires_at`),
  CONSTRAINT `fk_admin_sessions_admin_id`
    FOREIGN KEY (`admin_id`) REFERENCES `stk_admin_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------
-- stk_personinfo
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS `stk_personinfo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` varchar(13) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_th` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('ชาย','หญิง','ไม่ระบุ') COLLATE utf8mb4_unicode_ci DEFAULT 'ไม่ระบุ',
  `birthdate` date DEFAULT NULL,
  `occupation` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otherOccupation` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `education` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pid` (`pid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------
-- stk_health_record_befast
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS `stk_health_record_befast` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` varchar(13) NOT NULL,
  `record_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `symptoms` varchar(20) NOT NULL,
  `note` text,
  PRIMARY KEY (`id`),
  KEY `pid_idx` (`pid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------
-- stk_health_record
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS `stk_health_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` varchar(13) NOT NULL,
  `record_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `symptoms` varchar(20) NOT NULL,
  `note` text,
  PRIMARY KEY (`id`),
  KEY `pid_idx` (`pid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------
-- stk_adl_assessments
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS `stk_adl_assessments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_score` int(11) NOT NULL,
  `max_score` int(11) NOT NULL,
  `percent` decimal(5,2) NOT NULL,
  `interpretation` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dependency_level` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------
-- stk_adl_answers
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS `stk_adl_answers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assessment_id` int(11) NOT NULL,
  `question_key` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer_value` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `assessment_id` (`assessment_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------
-- stk_exercise_records
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS `stk_exercise_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` varchar(50) NOT NULL,
  `status` varchar(20) NOT NULL,
  `note` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------
-- stk_nutrition_records
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS `stk_nutrition_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` varchar(32) NOT NULL,
  `status` varchar(32) NOT NULL,
  `note` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------
-- stk_medication_records
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS `stk_medication_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meal_times` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `meals` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pid` (`pid`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------
-- stk_health_behavior
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS `stk_health_behavior` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `behaviors` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pid` (`pid`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------
-- stk_satisfaction_survey
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS `stk_satisfaction_survey` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ratings` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `additional_comment` text COLLATE utf8mb4_unicode_ci,
  `prevention_comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pid` (`pid`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------
-- stk_video_view_log
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS `stk_video_view_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `video_id` int(11) NOT NULL,
  `viewed_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pid` (`pid`),
  KEY `video_id` (`video_id`),
  KEY `viewed_at` (`viewed_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Done! Default login: admin / Admin1234
-- ============================================================
