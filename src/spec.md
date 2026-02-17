# Specification

## Summary
**Goal:** Introduce a clearly distinct Administrator-only access (password gate) screen layout while keeping existing admin verification behavior and leaving Parent/Child flows unchanged.

**Planned changes:**
- Create a new Administrator access screen layout/styling that is visually distinct from the Parent/Child screens, shown specifically when `isAdmin === true` and `isGatePassed === false`.
- Reuse the existing admin password gate functionality on the new screen (verify password, allowlisted password change tab, show/hide password toggles, success/error toasts) without behavior regressions.
- Add/adjust Administrator screen UI text via the existing i18n system, ensuring English strings exist (and pt-BR equivalents where supported).

**User-visible outcome:** Admin users who haven’t passed the gate see a new, Administrator-specific access screen with different visual layout, while the password verification and related admin gate actions work as before and Parent/Child experiences remain the same.
