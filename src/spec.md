# Specification

## Summary
**Goal:** Complete the Portuguese (pt-BR) translation across the entire app by removing hardcoded UI strings, expanding translation dictionaries, and ensuring language switching updates all screens and states immediately.

**Planned changes:**
- Replace hardcoded UI strings with i18n translation keys across ParentDashboard, ChildHome, and AdminPanel (including tabs, dialogs/modals where applicable, and conditional/empty states).
- Update `frontend/src/i18n/translations/en.ts` and `frontend/src/i18n/translations/pt-BR.ts` to include all keys used in the UI, keeping en as the fallback for missing pt-BR entries.
- Verify language switching via the existing LanguageSelector updates currently mounted and newly rendered UI (navigation, tabs, conditionals) without refresh and continues to persist via `appLanguage`.

**User-visible outcome:** When pt-BR is selected, the authenticated app experience (ParentDashboard/ChildHome/AdminPanel) displays fully localized Portuguese text across all screens and states, and switching languages updates immediately without needing to reload.
