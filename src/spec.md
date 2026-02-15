# Specification

## Summary
**Goal:** Fix the existing 6-digit pairing-code flow so frontend and backend constraints match, and add an alternative child→parent linking flow using parent phone number + SMS OTP verification.

**Planned changes:**
- Backend: Update pairing code generation to return an exact 6-digit numeric string and enforce exact 6-digit validation when pairing.
- Frontend: Ensure the child pairing UI properly reflects and reacts to pairing success (paired state updates without manual refresh) and shows clear errors for invalid 6-digit codes.
- Backend + Frontend: Add a new child pairing option to enter a parent/guardian phone number in the (00)000000000 format, start an OTP verification challenge, and link accounts on successful OTP entry.
- Backend: Add parent phone number storage/update with uniqueness enforcement; resolve parent accounts by phone number for phone-based pairing.
- Backend: Implement OTP lifecycle and error handling (incorrect/expired OTP, attempt limits, unknown phone, already paired) and an SMS-sending mechanism with a safe fallback when no provider is configured.
- Frontend: Add/adjust i18n strings (en + pt-BR) for phone pairing, OTP verification, and new/updated validation and error states.

**User-visible outcome:** Children can pair either by entering a valid 6-digit code or by entering a parent’s phone number and completing an SMS OTP verification; parents can add/update their phone number in their profile to enable phone-based pairing, with all related UI text localized in English and pt-BR.
