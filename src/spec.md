# Specification

## Summary
**Goal:** Add an account dropdown menu to the header user identity area, enabling profile photo changes, Internet Identity password management guidance, and end-to-end account deletion.

**Planned changes:**
- Make the header “{user name} • {role}” identity area clickable to open an anchored, keyboard-accessible dropdown (open via Enter/Space, close via Esc/outside click), and hide the trigger when no user profile exists.
- Implement dropdown menu items (i18n translated) including exactly: “Change profile photo”, “Change password”, “Delete account”, plus at least two additional non-admin-only useful actions (role-aware).
- “Change profile photo”: add a dialog with file picker, preview, save/remove support; update the header avatar immediately on success and persist the photo for the user.
- “Change password”: show an explanatory dialog that passwords are managed by Internet Identity, with a button to open the Internet Identity management page in a new tab.
- “Delete account”: add a destructive confirmation flow in the UI and a backend method to delete the caller’s profile and associated stored data; on success, clear/invalidate relevant cached queries and return to logged-out/onboarding state.
- Update Motoko data model and frontend types to store an optional profile photo on the user profile, including safe state migration if needed.
- Add/extend React Query mutations for saving profile photo and deleting account, with appropriate query invalidation so dependent UI updates correctly.

**User-visible outcome:** Clicking the user name/role in the header opens an account menu where the user can change their profile photo (with preview and persistence), be guided to Internet Identity for password changes, and delete their account with a clear confirmation step; the UI updates immediately after actions.
