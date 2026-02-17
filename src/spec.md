# Specification

## Summary
**Goal:** Replace the current AdminPanel with a new admin dashboard that includes sidebar navigation, user lists by role, login analytics, and device battery percentage visibility for admins.

**Planned changes:**
- Rework `frontend/src/pages/admin/AdminPanel.tsx` to a new dashboard layout modeled on the uploaded example (image-12), with a left sidebar and a main content area showing metric cards and drill-down links.
- Add backend + frontend support for “Parent users count” and “Child users count” metric cards; clicking each opens an admin-only list/table of users for that role (at minimum: name, principal, role, phone if present), including loading/empty states.
- Implement login analytics: record login events after successful authentication and expose an admin-only query for login counts scoped by selected day/month/year; add AdminPanel controls to select the scope and display results.
- Implement device battery reporting: allow authenticated users to submit/update their latest battery percentage (0–100) with timestamp; add an admin-only view/section in the AdminPanel to display user battery % and last updated time (in a structure similar to image-12).
- Extend `frontend/src/hooks/useQueries.ts` with typed React Query hooks for role-based user lists, login analytics by scope, and battery status; wire into the new AdminPanel with appropriate loading/error handling and reasonable refetch behavior.
- Add i18n keys for all new/changed AdminPanel strings in both `en` and `pt-BR` translation files.

**User-visible outcome:** Admins see a redesigned dashboard with sidebar navigation and overview cards; they can click Parents/Children metrics to view role-filtered user lists, view login counts by day/month/year, and review users’ latest reported battery percentages. Non-admin users cannot access these admin-only datasets.
