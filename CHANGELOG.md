# Changelog

All notable changes to this project will be documented in this file.

Format is based on a simplified version of Keep a Changelog.
This project uses [Semantic Versioning](https://semver.org/).

---

<!-- Template (for future entries)
## [X.Y.Z] - YYYY-MM-DD

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

## [Unreleased] - 1.1.0

Planned for next week. Includes all changes from 2026-04-09 through 2026-08-20.

### Added

- API layer under `/api`, `bootstrap.php`, `.env` (dotenv), and service-based architecture (`AuthService`, `PermissionService`, `SessionService`, `GroupService`, `DashboardService`, and others)
- New API endpoints: `/api/session.php`, `/api/get_summary.php`, `/api/get_dispatch_list.php`, `/api/get_expiring_passport.php`, `/api/get_expiring_visa.php`
- Change Requests page for reviewing date-change and cancellation requests from PCSKHI *(requested by Kondo-san)*
- `request_change_list` table, migration `db/migrations/001_create_request_change_list.sql`, and optional local seed `db/seeds/dev_request_change_list.sql`
- Change Request approve/deny API (`changeRequests/php/update_change_status.php`)
- Change Requests sidebar icon
- Version history modal from the sidebar version label
- Request List Activity History side panel (derived `activityLog` from `request_list` + `request_change_list`)
- Deep links: Request List `?open_request=` / `?request_id=`; Change Requests `?type=date_change|cancellation&openChangeRequestId=`
- Withdraw tab and withdraw logs on Change Requests
- Re-entry permit on Employee Details, Employee List (expiry), dashboard, and Report *(requested by Admin Group)*
- Dashboard: on-process dispatches, expiring passport/visa, and dispatch list table
- Email notification on change-request approve/deny (same To/CC pattern as dispatch approve/deny)
- HTML email templates for dispatch, date-change, and cancellation approve/decline
- Shared PCS dispatch email test mode (`DISPATCH_EMAIL_TEST_MODE` / `DISPATCH_EMAIL_DEV_IDS`) with PCSKHI-style `[TEST]` subject + recipient footer
- This changelog

### Changed

- Folder cleanup and JS split into page modules (`state`, `api`, `render`, `events`, etc.)
- Refactored Request List, Employee List, Employee Details, Check Availability, and Report pages
- Dashboard redesign (layout, summary cards, pagination)
- Change Requests and Request List UI
- Request List document status display
- Dashboard document alerts made responsive
- Database connections and passport/visa expiry windows now use `.env` (`PASSPORT_EXPIRY_WARNING_MONTHS`, `VISA_EXPIRY_WARNING_MONTHS`)
- Dashboard logic moved into `DashboardService.php`; new endpoints no longer depend on `globalFunctions.php`
- `emailStatusChange` now uses the shared test-mode helpers
- `create_change_request.php` rejects all change-request submissions from PCS; PCS only reviews/approves them
- Inactive employees removed from email recipients
- Company name updated in emails
- Approve/deny buttons disable after click to prevent double submit
- Modal color updates

### Fixed

- Passport/visa expiry window logic (passport: 9 months, visa: 6 months)
- Invalid date handling in summary calculations (removed hardcoded `-31`)
- Broken images in email templates

### Removed

- Total Days Past 1 Year from Report *(requested by Admin Group)*
- Request Date Change and Request Cancellation buttons/modals from Request List (submissions are KHI-only via PCSKHI)
- Unused `emailCancellationRequest()` from PCS `globalFunctions.php`
- Alert shown on approve/deny
- Dependency on `globalFunctions.php` for newly created API endpoints

### Notes

- Requested by Admin Group: re-entry permit; removal of Total Days Past 1 Year from Report
- Requested by Kondo-san: date-change and cancellation requests (Change Requests page)
- **Required for other developers:** run the migration on local `pcosdb` after pulling:
  ```bash
  mysql -u root pcosdb < db/migrations/001_create_request_change_list.sql
  ```
  Or import `db/migrations/001_create_request_change_list.sql` in phpMyAdmin (select `pcosdb` first).
  Safe to re-run (`CREATE TABLE IF NOT EXISTS`).
- **Optional local sample data** (do not run on production):
  ```bash
  mysql -u root pcosdb < db/seeds/dev_request_change_list.sql
  ```
  Requires employees `518` and `521` to exist (or edit emp numbers in the seed file).
  Creates approved `request_list` + `dispatch_list` rows, then pending change requests.
- Requires `composer install` and a configured `.env` after pulling
- Existing endpoints under `/php` and `/global` remain for backward compatibility
- Date change and cancellation requests are submitted from PCSKHI only; PCS still reviews them in Change Requests
- Activity History is derived (no new audit table). Approval timestamp uses `resolveDispatchApprovalTimestamp` when `date_modified` was overwritten by a CR decision. Approver names resolve from the current KDT president record when available
- Pending CR guards: `pending_date_change_request` / `pending_cancellation_request`; declined vs cancelled via `has_approved_cancellation`

---

## [1.0.0] - 2023-12-05

### Added

- Initial release
