# Admin Management Plan

## Summary

Build the admin area as a monorepo feature with a separate React admin app and the existing Spring Boot backend.

- Keep one backend application: `agriai_backend/agriai`.
- Keep the current user frontend: `agriai_frontend`.
- Add a new admin frontend app: `agriai_admin_frontend`.
- Admin login has its own screen but uses the existing auth API.
- Admin APIs use `/api/admin/**`.
- All delete actions are soft delete through `PATCH /{id}/delete`.
- Do not hard delete admin-managed data.

## Project Structure

```text
D:\AgriAI/
+-- agriai_backend/
|   +-- agriai/
+-- agriai_frontend/
+-- agriai_admin_frontend/
+-- docs/
|   +-- plans/
|       +-- admin-management.md
+-- docker-compose.yaml
```

## Backend Structure

Admin code stays inside the existing backend app.

```text
com.phucnguyen.agriai
+-- controller/
|   +-- admin/
+-- service/
|   +-- admin/
+-- dto/
|   +-- request/
|   |   +-- admin/
|   +-- response/
|       +-- admin/
+-- mapper/
|   +-- admin/
+-- entity/
+-- repository/
+-- security/
+-- exception/
+-- config/
+-- common/
+-- adapter/
+-- port/
+-- websocket/
```

Keep these shared:

- `entity`
- `repository`
- `security`
- `exception`
- `config`
- `common`

Do not create:

- `entity/admin`
- `repository/admin`
- `security/admin`
- `exception/admin`
- `config/admin`

Reason: admin works on the same core data as the user app. Admin is a permission layer, not a separate database domain.

## Admin Frontend Structure

Create a new React app:

```text
agriai_admin_frontend/
+-- src/
    +-- components/
    |   +-- common/
    |   +-- ui/
    +-- layout/
    |   +-- AdminLayout.jsx
    |   +-- AdminSidebar.jsx
    |   +-- AdminHeader.jsx
    +-- pages/
    |   +-- AdminLoginPage.jsx
    |   +-- DashboardPage.jsx
    |   +-- UserManagementPage.jsx
    |   +-- DiseaseManagementPage.jsx
    |   +-- CropTypeManagementPage.jsx
    |   +-- TreatmentPlanManagementPage.jsx
    |   +-- AiPerformancePage.jsx
    |   +-- DiagnosisReviewPage.jsx
    |   +-- IngredientManagementPage.jsx
    |   +-- DrugManagementPage.jsx
    |   +-- DrugInteractionManagementPage.jsx
    |   +-- AttachmentManagementPage.jsx
    +-- features/
    |   +-- auth/
    |   |   +-- LoginForm.jsx
    |   |   +-- useAdminAuth.js
    |   |   +-- authService.js
    |   +-- users/
    |   |   +-- UserTable.jsx
    |   |   +-- UserForm.jsx
    |   |   +-- UserFilters.jsx
    |   |   +-- useUsers.js
    |   +-- diseases/
    |   |   +-- DiseaseTable.jsx
    |   |   +-- DiseaseForm.jsx
    |   |   +-- useDiseases.js
    |   +-- crop-types/
    |   +-- treatment-plans/
    |   +-- ai-performance/
    |   +-- diagnosis-reviews/
    |   +-- ingredients/
    |   +-- drugs/
    |   +-- drug-interactions/
    |   +-- attachments/
    +-- services/
    |   +-- api.js
    |   +-- endpoints.js
    +-- routes/
    |   +-- AdminRoutes.jsx
    |   +-- RequireAdmin.jsx
    +-- hooks/
    +-- utils/
    +-- context/
    +-- App.jsx
    +-- index.jsx
```

Frontend rules:

- Use feature-based structure in `features/`.
- Each feature owns its table, form, filter, hook, and local logic.
- `pages/` are route-level containers only.
- Components must not call axios directly.
- `services/api.js` must create a separate admin axios instance.
- The admin axios instance must:
  - read `baseURL` from environment config;
  - attach JWT token in request interceptor;
  - handle `401`, `403`, and network errors in response interceptor.
- Do not copy-paste services from `agriai_frontend`; create admin-specific services with the same clean pattern.

## API Design

All admin APIs use this prefix:

```text
/api/admin
```

CRUD pattern:

```text
GET    /api/admin/{resource}
GET    /api/admin/{resource}/{id}
POST   /api/admin/{resource}
PUT    /api/admin/{resource}/{id}
PATCH  /api/admin/{resource}/{id}/delete
```

Do not use hard delete:

```text
DELETE /api/admin/{resource}/{id}
```

Soft delete behavior:

- Set `isDelete = true`.
- Set `deletedAt = now`.
- Set `deletedBy = currentAdminId`.
- List APIs return only `isDelete = false` by default.
- Optional: support `includeDeleted=true` if admin needs to view deleted records.

## Authentication And Authorization

Admin login:

```text
POST /api/auth/login
```

Admin frontend behavior:

- Use a separate admin login page.
- After login, check role from login response.
- Allow access only if role is `ADMIN` or authority is `ROLE_ADMIN`.
- If a normal user logs in, show a no-permission message and do not enter the admin dashboard.

Backend security:

```text
/api/admin/** -> ROLE_ADMIN
```

## Backend Modules

### User Admin

APIs:

```text
GET    /api/admin/users
GET    /api/admin/users/{id}
POST   /api/admin/users
PUT    /api/admin/users/{id}
PATCH  /api/admin/users/{id}/delete

```

Behavior:

- CRUD user.
- Update `isActive`.
- Update role.
- Lock user account by setting `isActive = false`.
- Unlock user account by setting `isActive = true`.
- Do not return `passwordHash`.
- Do not allow an admin to soft delete their own account.
- Do not allow an admin to lock their own account.

### Disease Admin

APIs:

```text
GET    /api/admin/diseases
GET    /api/admin/diseases/{id}
POST   /api/admin/diseases
PUT    /api/admin/diseases/{id}
PATCH  /api/admin/diseases/{id}/delete
```

Behavior:

- CRUD `Disease`.
- Link to `CropType`.
- Validate `diseaseCode` is not duplicated among non-deleted records.

### Crop Type Admin

APIs:

```text
GET    /api/admin/crop-types
GET    /api/admin/crop-types/{id}
POST   /api/admin/crop-types
PUT    /api/admin/crop-types/{id}
PATCH  /api/admin/crop-types/{id}/delete
```

Behavior:

- CRUD `CropType`.
- Support `isActive`.

### Treatment Plan Admin

APIs:

```text
GET    /api/admin/treatment-plans
GET    /api/admin/treatment-plans/{id}
POST   /api/admin/treatment-plans
PUT    /api/admin/treatment-plans/{id}
PATCH  /api/admin/treatment-plans/{id}/delete
```

Behavior:

- CRUD `TreatmentPlan`.
- Link to `Disease`.
- Link to `Drug`.
- Validate dosage min is not greater than dosage max.

### AI Performance Admin

APIs:

```text
GET /api/admin/ai-performance
GET /api/admin/ai-performance/chart
```

Behavior:

- Do not add a new metric table in v1.
- Calculate from existing data:
  - `DiagnoseReview.accurate`
  - `DiagnoseReview.rating`
  - `DiagnoseHistory`
  - `DiagnoseHistoryDetail.confidenceScore`
- Return:
  - accuracy;
  - average rating;
  - total reviews;
  - accurate count;
  - inaccurate count;
  - average confidence;
  - chart data by day or month.

### Diagnosis Review Admin

APIs:

```text
GET   /api/admin/diagnosis-reviews
GET   /api/admin/diagnosis-reviews/{id}
PATCH /api/admin/diagnosis-reviews/{id}/delete
```

Behavior:

- Manage user diagnosis reviews from `DiagnoseReview`.
- Show:
  - user;
  - accurate or inaccurate;
  - rating;
  - feedback;
  - review date.
- Filter by:
  - user;
  - accurate or inaccurate;
  - rating;
  - review date range.
- Admin v1 can view, view detail, and soft delete.
- Admin v1 does not create or edit user reviews.

### Ingredient Admin

APIs:

```text
GET    /api/admin/ingredients
GET    /api/admin/ingredients/{id}
POST   /api/admin/ingredients
PUT    /api/admin/ingredients/{id}
PATCH  /api/admin/ingredients/{id}/delete
```

Behavior:

- CRUD `Ingredient`.

### Drug Admin

APIs:

```text
GET    /api/admin/drugs
GET    /api/admin/drugs/{id}
POST   /api/admin/drugs
PUT    /api/admin/drugs/{id}
PATCH  /api/admin/drugs/{id}/delete
```

Behavior:

- CRUD `Drug`.
- Manage drug ingredients through `DrugIngredient`.

### Drug Interaction Admin

APIs:

```text
GET    /api/admin/drug-interactions
GET    /api/admin/drug-interactions/{id}
POST   /api/admin/drug-interactions
PUT    /api/admin/drug-interactions/{id}
PATCH  /api/admin/drug-interactions/{id}/delete
```

Behavior:

- CRUD `DrugInteraction`.
- Do not allow `ingredientA == ingredientB`.
- Normalize ingredient pair order to prevent duplicate reversed pairs.

### Attachment Admin

APIs:

```text
GET    /api/admin/attachments
GET    /api/admin/attachments/{id}
POST   /api/admin/attachments
PUT    /api/admin/attachments/{id}
PATCH  /api/admin/attachments/{id}/delete
```

Behavior:

- CRUD `Attachment` metadata.
- Soft delete metadata only.
- Do not delete physical files in v1.

## Admin Frontend Routes

Internal routes if deployed as a standalone app:

```text
/login
/
/users
/diseases
/crop-types
/treatment-plans
/ai-performance
/diagnosis-reviews
/ingredients
/drugs
/drug-interactions
/attachments
```

Public routes if deployed under `/admin` on the same domain:

```text
/admin/login
/admin
/admin/users
/admin/diseases
/admin/crop-types
/admin/treatment-plans
/admin/ai-performance
/admin/diagnosis-reviews
/admin/ingredients
/admin/drugs
/admin/drug-interactions
/admin/attachments
```

## UI Behavior

- CRUD pages:
  - list;
  - search;
  - filter;
  - pagination;
  - create form;
  - update form;
  - confirm soft delete modal.
- Diagnosis review page:
  - list;
  - filter;
  - detail;
  - soft delete only.
- AI performance page:
  - summary cards;
  - accuracy chart;
  - rating chart;
  - confidence chart.

## Validation And Error Handling

Backend:

- Use `@Valid` in controllers.
- Validate business rules in services.
- Throw `AppException` for expected business errors.
- Let `GlobalExceptionHandler` handle errors.

Frontend:

- Use form validation for create and update forms.
- Show API error messages to admin.
- Do not swallow errors silently.

## Test Plan

Backend tests:

- Normal user cannot call `/api/admin/**`.
- Admin can call `/api/admin/**`.
- CRUD works for main modules.
- `PATCH /{id}/delete` soft deletes records.
- Soft-deleted records do not appear in list APIs by default.
- Duplicate email validation works.
- Duplicate disease code validation works.
- Duplicate drug interaction pair validation works.
- Diagnosis review list, detail, filter, and soft delete work.
- AI performance calculation is correct from existing review data.

Admin frontend tests:

- Admin login succeeds and opens dashboard.
- Normal user login is rejected from admin app.
- Route guard blocks unauthenticated users.
- Axios interceptor attaches JWT token.
- `401` redirects to login.
- `403` shows no-permission error.
- List/search/filter/pagination works on main pages.
- Create/update forms validate basic input.
- Soft delete confirmation calls `PATCH /{id}/delete`.
- AI performance charts render with empty and non-empty data.

## Implementation Order

1. Add backend security rule for `/api/admin/**`.
2. Implement shared admin response/request DTO patterns.
3. Implement admin CRUD modules one by one.
4. Implement AI performance APIs.
5. Implement diagnosis review admin APIs.
6. Create `agriai_admin_frontend`.
7. Add admin axios instance and route guard.
8. Build admin layout.
9. Build admin feature pages one by one.
10. Run backend and frontend tests.

## Assumptions

- The project remains a monorepo.
- Admin frontend is a separate app inside the same repo.
- Backend remains one Spring Boot app.
- Admin login screen is separate, but login API is shared.
- Admin API prefix is `/api/admin`.
- Soft delete endpoint is `PATCH /api/admin/{resource}/{id}/delete`.
- AI performance v1 uses existing review and diagnosis data.
- Diagnosis review admin only manages user reviews: accurate/inaccurate, rating, and feedback.
- `Ingredient`, `Drug`, and `DrugInteraction` are separate admin modules.
- No hard delete is allowed for admin-managed data.
