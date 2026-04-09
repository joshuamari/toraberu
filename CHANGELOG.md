# PCS - Changelog

## [Unreleased]

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

### Changed
- Database connections now use environment variables (`.env`)
- Passport expiry warning window is now configurable via `.env` (`PASSPORT_EXPIRY_WARNING_MONTHS`)
- Visa expiry warning window is now configurable via `.env` (`VISA_EXPIRY_WARNING_MONTHS`)
- Removed dependency on `globalFunctions.php` for new endpoints
- Refactored dashboard-related logic into `DashboardService.php`

### Notes
- Existing endpoints under `/php` and `/global` remain unchanged for backward compatibility
- Frontend still uses legacy endpoints (migration pending)
- Requires running `composer install` after pulling changes (dotenv dependency)
- Ensure `.env` file is properly configured before running the application