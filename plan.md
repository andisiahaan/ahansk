# Simplify Notification System

The user requested to simplify the Notification Preferences system so that users can only turn on/off notification **channels** (e.g., Email, Push), while specific notification **types** are entirely determined by the system/developer and cannot be toggled by the user.

## Open Questions
None. The instruction is clear.

## Proposed Changes

### 1. `packages/shared`
- **[MODIFY] `src/notification-types.ts`**:
  - Remove `types` from the `NotificationPreferences` interface.
  - Keep `channels`.
  - Remove UI helper functions like `getUserNotificationTypes()` or `getTypesByCategory()` if they are no longer needed for rendering the preferences UI.
- **[MODIFY] `src/locales/en/modules/notifications.json`**:
  - Remove translations for `types`, `categories`, and `typeSection`.

### 2. `apps/backend`
- **[MODIFY] `src/modules/notifications/notification.service.ts`**:
  - In `getPreferences()`, stop mapping and defaulting the `types` field.
  - In `savePreferences()`, only save `channels`.
- **[MODIFY] `src/modules/notifications/notification.validation.ts`** (or relevant DTO file):
  - Remove `types` from the `PreferencesSchema` Zod validation schema.

### 3. `apps/frontend`
- **[MODIFY] `src/app/dashboard/account/notification-preferences/preferences-form.tsx`**:
  - Remove the "Type toggles" UI section entirely.
  - Remove logic related to mutating and grouping `types`.
  - Only render the "Channel toggles" section.

## Verification Plan

### Automated Tests
- `pnpm run type-check` to ensure no broken types across the monorepo.
- `pnpm --filter backend run test:e2e` to verify backend notification preference endpoints still work correctly without `types`.

### Manual Verification
- Rebuild the frontend and verify the Notification Preferences page no longer shows the "Types" section.
