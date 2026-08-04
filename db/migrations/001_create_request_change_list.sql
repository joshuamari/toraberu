-- Migration: create request_change_list
-- Database: pcosdb
--
-- How to run (XAMPP / local):
--   mysql -u root pcosdb < db/migrations/001_create_request_change_list.sql
-- Or import this file in phpMyAdmin against pcosdb.

CREATE TABLE IF NOT EXISTS `request_change_list` (
  `change_request_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `request_id` int(11) NOT NULL,
  `change_type` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `original_start_date` date NOT NULL,
  `original_end_date` date NOT NULL,
  `requested_start_date` date DEFAULT NULL,
  `requested_end_date` date DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `requested_by` int(11) NOT NULL,
  `requested_at` datetime NOT NULL,
  `date_modified` datetime DEFAULT NULL,
  PRIMARY KEY (`change_request_id`),
  KEY `idx_rcl_request_id` (`request_id`),
  KEY `idx_rcl_status` (`status`),
  KEY `idx_rcl_change_type` (`change_type`),
  KEY `idx_rcl_request_status` (`request_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
