---
id: update-purchase-type-tc3
title: Update Purchase Type
execution: manual
created: 12/21/2024
updated: 02/15/2025
---

# Update Purchase Type

## Title:

Update Purchase Type

## Description:

A logged-in and active user can update an existing purchase type.

## Preconditions:

User is logged in and active. User is on the `view purchase type` page. A purchase type exists. A purchase exists of purchase type `Office Supplies`

## Steps to Execute:

1. User clicks on the `Edit` action from ellipsis next to an existing purchase type.
2. Verify the `Edit Purchase Type` form is displayed with the current details of the purchase type:
   - **Name:** Office Supplies
   - **Status:** toggle switch pre-selected to `enable`
   - **Color:** color picker with pre-filled `blue`
   - **Description:** `Items used in the office` and counter is 18/400
   - **Tags:** `stationery, office` and counter is 2/10
3. Verify 2 buttons, `save` and `cancel`, are displayed.
4. User updates the form fields:
   - **Name:** Office Supplies Updated
   - **Color:** green
   - **Description:** `Updated description for office supplies` and counter is 34/400
   - **Tags:** `stationery, office, updated` and counter is 3/10
5. User clicks on the `Save` button.
6. Verify the updated purchase type is displayed in the list with the correct details.
7. User clicks on `View` button for `Office Supplies Updated`. verify details shown.
8. User navigated `add purchase` page
9. Verify `Office Supplies Updated` exists in `purchase type` dropdown
10. On `view expense page`, verify existing purchase is showing updated purchase type name `Office Supplies Updated`
11. User clicks `Edit` action on existing purchase. On `update purchase page`, verify selected purchase type label is updated.

## Expected Outcome:

- The `Edit Purchase Type` form is displayed.
- The updated purchase type is displayed in the list with the correct details.
- The updated purchase type is displayed in view expense, add purchase and edit purchase pages.

## Impact Area:

### Frontend

- View Purchase Type page
- Edit Purchase Type page
- Add Purchase page
- Edit Purchase page
- View Expenses page
- settings module
- purchase type component

### Backend API

- purchase type api
- purchase type tags api

## Type of Test:

- End to End
- Demo site testable

## Tags:

- feature=`settings,purchase,expense`
- execution=`manual`
- impact=`medium`
- type=`positive`
- devices=`desktop,mobile`

## Affected Versions:

v0.1.0

## Attachments:

Screenshots

## Average Performance Time:

### Test:

total=1 min

### Browser:

#### Network calls:

- /api/settings/purchase-types/update=1.44 sec

### Lambda:

#### update purchase type

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
