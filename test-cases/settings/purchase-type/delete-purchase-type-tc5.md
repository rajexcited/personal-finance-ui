---
id: delete-purchase-type-tc5
title: Delete Purchase Type
execution: manual
created: 12/21/2024
updated: 02/15/2025
---

# Delete Purchase Type

## Title:

Delete Purchase Type

## Description:

A logged-in and active user can delete an existing purchase type.

## Preconditions:

User is logged in and active. User is on the `view purchase type` page. A purchase type exists. A purchase exists of purchase type `food shopping`

## Steps to Execute:

1. User clicks on the `Delete` action from ellipsis next to an existing purchase type `food shopping`.
2. Verify a confirmation dialog is displayed with the message `Are you sure you want to delete this purchase type?`.
3. Verify 2 buttons, `confirm` and `cancel`, are displayed in the confirmation dialog.
4. User clicks on the `Cancel` button.
5. Verify the purchase type is not removed from the list.
6. repeat steps 1, 2 and 3.
7. User clicks on the `Confirm` button.
8. Verify the purchase type is removed from the list.
9. Verify a success message `Purchase type deleted successfully` is displayed.
10. User navigates to the `add purchase` page.
11. Verify the deleted purchase type does not exist in the `purchase type` dropdown.
12. On the `view expense page`, verify any existing purchases of the deleted purchase type show the same label `food shopping` as the purchase type.
13. User clicks `Edit` action on existing purchase of the deleted purchase type. On `update purchase page`, verify selected purchase type label is same `food shopping` in purchase type dropdown.

## Expected Outcome:

- The confirmation dialog is displayed.
- The purchase type is removed from the list.
- A success message is displayed.
- The deleted purchase type does not appear in the `purchase type` dropdown.
- Existing purchases of the deleted purchase type show `food shopping` as the purchase type.

## Impact Area:

### Frontend

- View Purchase Type page
- Add Purchase page
- Edit Purchase page
- View Expenses page
- settings module
- purchase type component

### Backend API

- purchase type api

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

- /api/settings/purchase-types/delete=1.44 sec

### Lambda:

#### delete purchase type

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
