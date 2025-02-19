---
id: update-refund-reason-tc3
title: Update Refund Reason
execution: manual
created: 12/21/2024
updated: 02/15/2025
---

# Update Refund Reason

## Title:

Update Refund Reason

## Description:

A logged-in and active user can update an existing refund reason.

## Preconditions:

User is logged in and active. User is on the `view refund reason` page. A refund reason exists. A refund exists of refund reason `Product Return`

## Steps to Execute:

1. User clicks on the `Edit` action from ellipsis next to an existing refund reason.
2. Verify the `Edit Refund Reason` form is displayed with the current details of the refund reason:
   - **Name:** Product Return
   - **Status:** toggle switch pre-selected to `enable`
   - **Color:** color picker with pre-filled `red`
   - **Description:** `Defective product return` and counter is 12/400
   - **Tags:** `refund, return` and counter is 2/10
3. Verify 2 buttons, `save` and `cancel`, are displayed.
4. User updates the form fields:
   - **Name:** Product Return Updated
   - **Status:** toggle switch pre-selected to `disable`
   - **Color:** blue
   - **Description:** `Updated description for Defective product return` and counter is 48/400
   - **Tags:** `refund, return, updated` and counter is 3/10
5. User clicks on the `Save` button.
6. Verify the updated refund reason is displayed in the list with the correct details.
7. User clicks on `View` button for `Product Return Updated`. verify details shown.
8. User navigated `add refund` page
9. Verify `Product Return Updated` exists in `refund reason` dropdown
10. On `view expense page`, verify existing refund is showing updated refund reason name `Product Return Updated`
11. User clicks `Edit` action on existing refund. On `update refund page`, verify selected refund reason label is updated.

## Expected Outcome:

- The `Edit Refund Reason` form is displayed.
- The updated refund reason is displayed in the list with the correct details.
- The updated refund reason is displayed in view expense, add refund and edit refund pages.

## Impact Area:

### Frontend

- View Refund Reason page
- Edit Refund Reason page
- Add Refund page
- Edit Refund page
- View Expenses page
- settings module
- refund reason component

### Backend API

- refund reason api
- refund reason tags api

## Type of Test:

- End to End
- Demo site testable

## Tags:

- feature=`settings,refund,expense`
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

- /api/settings/refund-reasons/update=1.44 sec

### Lambda:

#### update refund reason

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
