# Specification

## Summary
**Goal:** Fix leader/admin password validation so the password `Liderdoprojetox1` correctly grants admin/leader access.

**Planned changes:**
- Update backend `verifyAdminPassword` so it returns `true` for the exact password string `Liderdoprojetox1` (for authenticated users).
- Fix the backend default/stored admin password value to be exactly `Liderdoprojetox1` (remove the current trailing semicolon in `backend/main.mo`).
- Ensure backend allowlisting/admin-grant functions that compare the password accept `Liderdoprojetox1` and successfully allowlist the caller principal in the existing profile setup admin flow.
- Add a conditional state migration on upgrade to convert an existing stored password value `Liderdoprojetox1;` to `Liderdoprojetox1` without changing any other persisted state (including allowlisted admin principals).
- Update frontend admin password submission flows (AdminPasswordGate and ProfileSetupDialog admin role flow) so that entering `Liderdoprojetox1` results in successful verification and access when the backend confirms validity.

**User-visible outcome:** Entering `Liderdoprojetox1` in the existing admin/leader password prompts successfully passes the admin gate and allows completing the admin role setup without an “incorrect password” error.
