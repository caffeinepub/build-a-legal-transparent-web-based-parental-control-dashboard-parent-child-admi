# Specification

## Summary
**Goal:** Add a restricted ADMINISTRATOR role with a password-gated admin dashboard, and expand the dashboard with additional on-chain metrics including presence-based active users.

**Planned changes:**
- Add an “ADMINISTRATOR” role option to profile creation, enabled only when the entered identifier matches the leader allowlist (specific emails or phone number), with clear UI messaging when restricted.
- Enforce ADMINISTRATOR role restrictions on the backend so non-allowlisted users cannot save or become admins even if manipulating the frontend.
- Set the default admin password to “Liderdoprojetox1” and restrict admin password changes to leader-allowlisted admin accounts only.
- Add an ADMINISTRATOR access step: when backend recognizes the caller as admin, require a session-based password gate before showing the AdminPanel.
- Expand admin dashboard metrics to show totals for Parent users, Child users, Parent→Child link count, total saved profiles (ever logged in), and “users currently with the platform open” via a lightweight heartbeat presence mechanism.
- Add at least 3 additional admin metrics computed from existing on-chain state (aggregated only), and display them in the admin dashboard without exposing individual child records.

**User-visible outcome:** Users can create an ADMINISTRATOR profile only with leader-allowlisted identifiers; admins must pass a password gate to access the dashboard, where they can view expanded platform-wide aggregated metrics including active/open users and additional computed counts.
