# Specification

## Summary
**Goal:** Fix the app’s light and dark theme colors so interface surfaces and text have consistent, readable contrast while keeping the existing navy/white direction.

**Planned changes:**
- Update global theme CSS variables in `frontend/src/index.css` for both `:root` (light) and `.dark` (dark) to ensure backgrounds/cards/popovers/borders/accents are clearly distinct from their corresponding foreground text colors and meet WCAG AA contrast for body text.
- Adjust muted and secondary/primary/accent token pairs so muted text remains readable and button text remains clearly legible on button backgrounds in both themes.
- Audit key layouts/pages (e.g., `frontend/src/App.tsx` and shared header/footer layouts) to remove/replace hard-coded color utility classes with theme token-based classes so low-contrast combinations are not reintroduced.

**User-visible outcome:** Text and UI surfaces are clearly readable across the app in both light and dark mode, with consistent contrast on backgrounds, cards/popovers, and buttons.
