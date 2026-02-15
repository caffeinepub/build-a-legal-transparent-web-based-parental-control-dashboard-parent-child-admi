# Specification

## Summary
**Goal:** Enable best-effort live location sharing in the background (without needing the app kept open), with clear messaging about platform limitations and updated transparency/consent copy.

**Planned changes:**
- Keep Live Location Sharing enabled/controlled via existing backend status/toggle hooks while adding best-effort periodic location capture/submission that continues when the page is backgrounded (not focused).
- Add installable PWA support (web app manifest + service worker registration) and, where supported, use background-capable mechanisms (e.g., background/periodic sync) to queue and/or submit location updates when the UI is closed.
- Add safe fallbacks for browsers without background/periodic sync support, and show a clear notice/status when only foreground/background-tab operation is possible.
- Update all user-facing copy (EN + pt-BR) for Live Location Sharing helper text and parent-side descriptions to match new background behavior.
- Update Transparency & Policies content to remove/adjust any statement that the app does not collect data in the background when background live sharing is enabled by the child.

**User-visible outcome:** After enabling Live Location Sharing, the app will continue attempting location updates in the background when possible (and via PWA/background features on supported platforms), while clearly informing users when their browser/device cannot keep sharing after the UI is closed.
