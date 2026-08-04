-- Seed (local/dev only): one pending date-change + one pending cancellation
-- Database: pcosdb
--
-- Prerequisites:
--   1. Run db/migrations/001_create_request_change_list.sql first
--   2. Employees 518 and 521 must exist in kdtphdb_new.employee_list
--      (change emp_number / requester_id below if needed on your machine)
--
-- How to run:
--   mysql -u root pcosdb < db/seeds/dev_request_change_list.sql
-- Or import this file in phpMyAdmin against pcosdb.
--
-- Do NOT run on production.

START TRANSACTION;

-- Date change sample (emp 518)
INSERT INTO `request_list` (
  `requester_id`, `emp_number`, `location_id`, `specific_loc`,
  `dispatch_from`, `dispatch_to`, `invitation_id`, `work_order`, `project_name`,
  `site_dispatch`, `dept_id`, `work_content`,
  `req_name`, `req_tel`, `req_fax`, `gap_name`, `gap_tel`,
  `cdcp_name`, `cdcp_tel`, `dept_in_charge`, `dic_name`, `dic_tel`,
  `date_requested`, `request_status`, `date_modified`
) VALUES (
  464, 518, 1, 'Kobe city',
  '2026-10-05', '2026-10-16', 3, 'SEED001', 'Seed date change sample',
  0, 1, 'Seed work content for date change sample',
  'S. Tabata', '+81-(0)78-682-5039', '+81-(0)78-682-5041',
  'Mr. T. Kurosumi', '(81-78-682-5202/Ext. 7-20-81101)',
  'Mr. H. Kanari', '(81-78-682-5072/Ext. 7-30-33217)',
  'Boiler Plant Department', 'Seed DIC', '078-682-5202',
  NOW(), 1, NOW()
);

SET @date_request_id = LAST_INSERT_ID();

INSERT INTO `dispatch_list` (
  `emp_number`, `location_id`, `dispatch_from`, `dispatch_to`, `request_id`
) VALUES (
  518, 1, '2026-10-05', '2026-10-16', @date_request_id
);

INSERT INTO `request_change_list` (
  `request_id`, `change_type`, `status`,
  `original_start_date`, `original_end_date`,
  `requested_start_date`, `requested_end_date`,
  `reason`, `requested_by`, `requested_at`, `date_modified`
) VALUES (
  @date_request_id, 'date_change', 'pending',
  '2026-10-05', '2026-10-16',
  '2026-10-12', '2026-10-23',
  'Seed date change request for local UI testing',
  464, NOW(), NULL
);

-- Cancellation sample (emp 521)
INSERT INTO `request_list` (
  `requester_id`, `emp_number`, `location_id`, `specific_loc`,
  `dispatch_from`, `dispatch_to`, `invitation_id`, `work_order`, `project_name`,
  `site_dispatch`, `dept_id`, `work_content`,
  `req_name`, `req_tel`, `req_fax`, `gap_name`, `gap_tel`,
  `cdcp_name`, `cdcp_tel`, `dept_in_charge`, `dic_name`, `dic_tel`,
  `date_requested`, `request_status`, `date_modified`
) VALUES (
  464, 521, 1, 'Kobe city',
  '2026-11-02', '2026-11-13', 3, 'SEED002', 'Seed cancellation sample',
  0, 1, 'Seed work content for cancellation sample',
  'S. Tabata', '+81-(0)78-682-5039', '+81-(0)78-682-5041',
  'Mr. T. Kurosumi', '(81-78-682-5202/Ext. 7-20-81101)',
  'Mr. H. Kanari', '(81-78-682-5072/Ext. 7-30-33217)',
  'Boiler Plant Department', 'Seed DIC', '078-682-5202',
  NOW(), 1, NOW()
);

SET @cancel_request_id = LAST_INSERT_ID();

INSERT INTO `dispatch_list` (
  `emp_number`, `location_id`, `dispatch_from`, `dispatch_to`, `request_id`
) VALUES (
  521, 1, '2026-11-02', '2026-11-13', @cancel_request_id
);

INSERT INTO `request_change_list` (
  `request_id`, `change_type`, `status`,
  `original_start_date`, `original_end_date`,
  `requested_start_date`, `requested_end_date`,
  `reason`, `requested_by`, `requested_at`, `date_modified`
) VALUES (
  @cancel_request_id, 'cancellation', 'pending',
  '2026-11-02', '2026-11-13',
  NULL, NULL,
  'Seed cancellation request for local UI testing',
  464, NOW(), NULL
);

COMMIT;

SELECT
  @date_request_id AS date_dispatch_request_id,
  @cancel_request_id AS cancel_dispatch_request_id;
