# Fix User Login Error Handling

## Request

Fix user login behavior so invalid credentials do not redirect to the landing page, server errors are not reported as invalid credentials, and regression coverage is added with Playwright.

## Files to update

- `agriai_frontend/src/services/api.js`
- `agriai_frontend/src/pages/LoginPage.jsx`
- `agriai_frontend/tests/login.spec.js`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/exception/GlobalExceptionHandler.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/security/CustomUserDetailsService.java`

## Steps

1. Exclude `/api/auth/login` from the frontend token-refresh interceptor.
2. Split frontend login error messages for credential, server, and network errors.
3. Split backend auth exception handling for bad credentials, disabled accounts, and internal auth failures.
4. Mark inactive users as disabled in Spring Security while keeping deleted users as invalid credentials.
5. Add Playwright tests for invalid credentials, backend `500`, and network failure.
6. Run backend, frontend unit, and Playwright checks.
