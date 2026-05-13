# Diagnosis Flow Fixes

## Goal
- Keep the diagnose button disabled until an image is selected.
- Align diagnosis flow with the expected behavior for guest users, validation messages, GPS denied warning, and Vision AI failures.

## Changes
- Do not persist diagnosis history/details/recommendations for guest users.
- Keep authenticated user history flow: `PENDING -> COMPLETED/FAILED`.
- Keep weather failures non-blocking.
- Treat Vision AI failures as system errors instead of unknown diagnosis.
- Show clear frontend messages for missing crop, GPS denied, unknown diagnosis, and system errors.

## Checks
- Run backend tests.
- Run frontend build when the workspace has all imported page files.
