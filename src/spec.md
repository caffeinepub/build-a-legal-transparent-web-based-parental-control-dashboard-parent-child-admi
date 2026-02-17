# Specification

## Summary
**Goal:** Hide the “Administrator” role during profile setup and only reveal it when a specific phone number is entered.

**Planned changes:**
- Update the profile setup dialog so the “Administrator” role option is not rendered by default.
- Add digits-only phone normalization for the “Phone Number” field and reveal “Administrator” only when it matches `91980115950` (e.g., `(91)980115950`).
- Ensure the phone number input is available before/while selecting a role so users can unlock “Administrator” without extra steps.
- Prevent inconsistent state: if “Administrator” is selected and the phone number changes to a non-matching value, automatically switch to a non-admin role and hide “Administrator” again.
- Guard UI flow so no admin-related verification/allowlist actions can be initiated unless “Administrator” is visible and selected.

**User-visible outcome:** During profile setup, users only see the Administrator role after entering the unlock phone number; if they change the number afterward, the Administrator option disappears and cannot remain selected.
