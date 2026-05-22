# Comment Cleanup Plan

This plan details the process for cleaning, simplifying, and standardizing comments across the entire AgriAI project (Spring Boot Backend and React Frontend) to make it clean, readable, and developer-friendly.

## User Review Required

> [!IMPORTANT]
> - **Comment Language**: Simple English (B1 level). Avoid overly complex terms or jargon.
> - **Comment Style**: Use `//` prefix for comments in both Backend (Java) and Frontend (JS/JSX). Avoid formal Javadoc `/** ... */` as confirmed by the user to keep the styling simple and consistent.
> - **Zero Code Modification**: Absolutely NO changes to variable names, function names, class names, or code logic. Only comments will be added, simplified, or updated.
> - **No Trivial Comments**: Do not comment on obvious lines (e.g. `int id = user.getId();`). Only comment on class/method purposes, main workflows, business logic, and complex algorithms (explaining "why" a specific approach is used).

---

## Proposed Batches

To manage this safely and avoid conflicts, the work will be divided into the following batches:

### Phase 1: Spring Boot Backend - Controllers and Exception Handlers
Targeting REST entrypoints and global handlers to explain incoming request structures and routing rules.
- [agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller)
- [agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/exception/](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/exception)

### Phase 2: Spring Boot Backend - Core Services
Focusing on business logic where comments are most critical to explain rules, AI reasoning, and workflow logic.
- [agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service)

### Phase 3: Spring Boot Backend - Entities, Mappers, Repositories, Security, Websocket
Documenting DB relations, security filter chains, and mapping configurations.
- [agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity)
- [agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository)
- [agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/security/](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/security)
- [agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/mapper/](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/mapper)

### Phase 4: React Frontend - Common Services & Hooks
Documenting Axios setup, token refresh interceptors, and reusable custom hooks.
- [agriai_frontend/src/services/](file:///d:/AgriAI/agriai_frontend/src/services)
- [agriai_frontend/src/hooks/](file:///d:/AgriAI/agriai_frontend/src/hooks)

### Phase 5: React Frontend - Pages and Component Features
Documenting UI layouts, state interactions, and conditional styling blocks.
- [agriai_frontend/src/pages/](file:///d:/AgriAI/agriai_frontend/src/pages)
- [agriai_frontend/src/features/](file:///d:/AgriAI/agriai_frontend/src/features)

---

## Verification Plan

### Automated Verification
For each phase of the cleanup:
1. **Backend Verification**: Run Maven compile to verify that no syntax errors were introduced:
   `mvn clean compile` inside `agriai_backend/agriai/`.
2. **Frontend Verification**: Run React production build to verify no syntax errors:
   `npm run build` inside `agriai_frontend/`.
3. **Git Diff Audit**: Run `git diff` on each phase to verify that only green comment lines (`+ //` or `- //`) are added/changed, ensuring zero changes to logic.

### Manual Verification
- Verify that the comments are written in simple B1 English and are easy to understand.
- Spot check a few files from both Backend and Frontend to ensure formatting guidelines are adhered to.
