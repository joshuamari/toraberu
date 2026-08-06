# Changelog

All notable changes to this project will be documented in this file.

Format is based on a simplified version of Keep a Changelog.

---

<!-- Template (for future entries)
## [YYYY-MM-DD] - Release Title

### Added
- New features

### Changed
- Changes in existing behavior

### Fixed
- Bug fixes

### Removed
- Removed features or deprecated logic

### Notes
- Optional context, warnings, or migration notes
-->

## [2026-08-06] - PCS Date Change Request Restriction

### Removed

- Removed Request Date Change button and modal from Request List (date changes are KHI-only via PCSKHI)

### Changed

- `create_change_request.php` now rejects `date_change` submissions from PCS; cancellation requests remain supported

---

## [2026-08-05] - Request List Activity History

### Added

- Request List API now embeds derived `activityLog` events from `request_list` + `request_change_list` (submit, approve/decline, date-change/cancellation lifecycle, cancelled)
- Activity History side panel in the dispatch detail modal for non-pending requests (approved / declined / cancelled / completed)
- Change-request action on approved active dispatches: Request Cancellation modal
- Create endpoint: `changeRequests/php/create_change_request.php`
- Pending CR guards (`pending_date_change_request` / `pending_cancellation_request`) and declined-vs-cancelled resolution via `has_approved_cancellation`
- Deep links: Request List `?open_request=` / `?request_id=`; Change Requests `?type=date_change|cancellation&openChangeRequestId=`

### Notes

- Activity History is derived (no new audit table). Approval timestamp uses `resolveDispatchApprovalTimestamp` when `date_modified` was overwritten by a CR decision.
- Approver actor names resolve from the current KDT president record when available.
- Date change requests are submitted from PCSKHI only; PCS still reviews them in Change Requests.

---

## [2026-08-04] - Change Request Workflow

### Added

- Added `request_change_list` table for date-change and cancellation requests (separate from `request_list`)
- Added DB migration: `db/migrations/001_create_request_change_list.sql`
- Added optional local seed: `db/seeds/dev_request_change_list.sql` (1 pending date change + 1 pending cancellation)
- Change Requests page now loads from `request_change_list`
- Added approve/deny API: `changeRequests/php/update_change_status.php`

### Notes

- **Required for other developers:** run the migration on local `pcosdb` after pulling:
  ```bash
  mysql -u root pcosdb < db/migrations/001_create_request_change_list.sql
  ```
  Or import `db/migrations/001_create_request_change_list.sql` in phpMyAdmin (select `pcosdb` first).
- Safe to re-run (`CREATE TABLE IF NOT EXISTS`)
- **Optional local sample data** (do not run on production):
  ```bash
  mysql -u root pcosdb < db/seeds/dev_request_change_list.sql
  ```
  Requires employees `518` and `521` to exist (or edit emp numbers in the seed file).
  Creates approved `request_list` + `dispatch_list` rows, then pending change requests.
---

## [Unreleased] - API Refactor & Environment Configuration

### Added

- Introduced new API layer under `/api`
- Added `bootstrap.php` for centralized initialization
- Added `.env` support using dotenv
- Created service-based architecture:
  - AuthService
  - PermissionService
  - SessionService
  - GroupService
  - DashboardService
- Added new API endpoints:
  - `/api/session.php`
  - `/api/get_summary.php`
  - `/api/get_dispatch_list.php`
  - `/api/get_expiring_passport.php`
  - `/api/get_expiring_visa.php`
- Added new folder Change Request for monitoring cancellations and date change requests from khi

### Changed

- Database connections now use environment variables (`.env`)
- Passport expiry warning window is now configurable via `.env` (`PASSPORT_EXPIRY_WARNING_MONTHS`)
- Visa expiry warning window is now configurable via `.env` (`VISA_EXPIRY_WARNING_MONTHS`)
- Refactored dashboard-related logic into `DashboardService.php`
- New endpoints no longer depend on `globalFunctions.php`

### Fixed

- Corrected expiry window logic (passport: 9 months, visa: 6 months)
- Fixed invalid date handling in summary calculations (removed hardcoded `-31`)

### Removed

- Dependency on `globalFunctions.php` for newly created API endpoints

### Notes

- Existing endpoints under `/php` and `/global` remain unchanged for backward compatibility
- Frontend still uses legacy endpoints (migration pending)
- Requires running `composer install` after pulling changes
- Ensure `.env` file is properly configured before running the application

---
