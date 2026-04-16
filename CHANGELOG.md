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
