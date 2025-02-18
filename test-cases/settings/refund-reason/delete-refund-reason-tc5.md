---
id: delete-refund-reason-tc5
title: Delete Refund Reason
execution: manual
created: 12/21/2024
updated: 02/15/2025
---

# Delete Refund Reason

## Title:

Delete Refund Reason

## Description:

A logged-in and active user can delete an existing refund reason.

## Preconditions:

User is logged in and active. User is on the `view refund reason` page. A refund reason exists. A refund exists of refund reason `Product Return`

## Steps to Execute:

1. User clicks on the `Delete` action from ellipsis next to an existing refund reason `Product Return`.
2. Verify a confirmation dialog is displayed with the message `Are you sure you want to delete this refund reason?`.
3. Verify 2 buttons, `confirm` and `cancel`, are displayed in the confirmation dialog.
4. User clicks on the `Cancel` button.
5. Verify the refund reason is not removed from the list.
6. repeat steps 1, 2 and 3.
7. User clicks on the `Confirm` button.
8. Verify the refund reason is removed from the list.
9. Verify a success message `Refund Reason deleted successfully` is displayed.
10. User navigates to the `add refund` page.
11. Verify the deleted refund reason does not exist in the `refund reason` dropdown.
12. On the `view expense page`, verify any existing refunds of the deleted refund reason show the same label `Product Return` as the refund reason.
13. User clicks `Edit` action on existing refund of the deleted refund reason. On `update refund page`, verify selected refund reason label is same `Product Return` in refund reason dropdown.

## Expected Outcome:

- The confirmation dialog is displayed.
- The refund reason is removed from the list.
- A success message is displayed.
- The deleted refund reason does not appear in the `refund reason` dropdown.
- Existing refunds of the deleted refund reason show `Product Return` as the refund reason.

## Impact Area:

### Frontend

- View Refund Reason page
- Add Refund page
- Edit Refund page
- View Expenses page
- settings module
- refund reason component

### Backend API

- refund reason api

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

- /api/settings/refund-reasons/delete=1.44 sec

### Lambda:

#### delete refund reason

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
