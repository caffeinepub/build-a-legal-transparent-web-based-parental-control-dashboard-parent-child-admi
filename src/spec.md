# Specification

## Summary
**Goal:** Build a legal, transparent web-based parental control dashboard with Internet Identity sign-in, role-based experiences (Parent/Child/Admin), consent-based parent–child pairing, and dashboards for schedules, check-ins, policies, alerts, and auditability.

**Planned changes:**
- Add Internet Identity authentication and store user profiles keyed by Principal with roles (Parent/Child/Admin), enforcing role-based route/API access.
- Implement Parent→Child onboarding pairing via time-limited invite code with explicit child consent/disclosure before linking.
- Build Parent dashboard to manage linked children (summary + sections for Activity, Schedules & Limits, Content Filters, Location, Alerts, Audit Log) with clear transparency labels for child-submitted/consented data.
- Implement per-child schedules and time limits persisted in the backend; editable by Parent (and Admin), viewable read-only by Child.
- Create Child check-in area to submit activity and optional location entries with per-entry consent and visibility into what will be shared; include submission history for Child and chronological viewing for Parent.
- Add per-child content filter policy configuration (categories + allowlist/blocklist) stored in backend and shown read-only to Child with last-updated metadata.
- Implement “excessive use” alerts based on submitted activity vs daily limit; show in Parent and Child UIs, allow Parent acknowledgment, and allow Child to send a “request more time” note.
- Create Admin panel to manage accounts/roles/links/disable accounts and view aggregated metrics only (no access to raw child-submitted activity/location content via UI or endpoints).
- Add immutable backend audit log for sensitive actions and expose relevant views to Parent (their linked children) and Admin (metadata/aggregate).
- Add a Transparency & Policies page with supervision disclosure, data handling/consent explanations, and explicit non-supported features (no covert monitoring, screen mirroring, remote camera).
- Establish and apply a coherent visual theme across the app (avoid blue/purple as primary) and ensure responsive UI.
- Add generated static images (logo + hero illustration) under frontend public assets and use them in the app shell and landing/onboarding screens.

**User-visible outcome:** Users can sign in with Internet Identity and access a role-appropriate experience: Parents can pair with children, configure schedules/limits and policies, review consented check-ins, see alerts and audit logs; Children can consent to pairing and submit/view their own check-ins and see policies/limits transparently; Admins can manage accounts and view only aggregated metrics with audit metadata.
