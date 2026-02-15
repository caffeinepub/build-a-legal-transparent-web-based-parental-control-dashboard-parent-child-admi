# Specification

## Summary
**Goal:** Add an in-app parent confirmation step for phone-based parent-child linking so a child’s pairing request remains pending until the addressed parent confirms.

**Planned changes:**
- Backend: when a child submits a parent phone number that matches a registered parent, create and persist a pending confirmation request (parentId, childId, phoneNumber, createdAt, status) and prevent phone-based pairing completion until confirmed.
- Backend: add actor methods to create a request (child), list pending requests for the current parent (parent), and confirm a request (parent), with proper access control so only the addressed parent (and admins, if applicable) can view/act.
- Backend: on confirmation, create the parent-child link, mark the request confirmed/closed, and record an audit log entry.
- Frontend (parent): show an alert/banner/card when there are pending phone confirmation requests and allow one-click confirmation; update UI via refetch/invalidation and show a success message.
- Frontend (child): after submitting the phone number, show a “pending parent confirmation” state (no SMS/OTP entry) and poll/refetch until pairing is confirmed, then reflect the paired state.
- Frontend: add/update React Query hooks in `frontend/src/hooks/useQueries.ts` to support request creation, pending-status fetching, and confirmation, invalidating keys like `['myParent']` and `['myChildren']` after confirmation.
- Frontend: add any new user-facing strings in English via the existing i18n system (update the English dictionary at minimum).

**User-visible outcome:** A child can request linking by entering a parent’s phone number and will see a pending state until the parent confirms; the parent will see an in-app alert and can confirm the link with one click.
