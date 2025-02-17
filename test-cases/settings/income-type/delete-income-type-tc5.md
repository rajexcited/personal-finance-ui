---
id: delete-income-type-tc5
title: Delete Income Type
execution: manual
created: 12/21/2024
updated: 02/15/2025
---

# Delete Income Type

## Title:

Delete Income Type

## Description:

A logged-in and active user can delete an existing income type.

## Preconditions:

User is logged in and active. User is on the `view income type` page. A income type exists. A income exists of income type `wage`

## Steps to Execute:

1. User clicks on the `Delete` action from ellipsis next to an existing income type `wage`.
2. Verify a confirmation dialog is displayed with the message `Are you sure you want to delete this income type?`.
3. Verify 2 buttons, `confirm` and `cancel`, are displayed in the confirmation dialog.
4. User clicks on the `Cancel` button.
5. Verify the income type is not removed from the list.
6. repeat steps 1, 2 and 3.
7. User clicks on the `Confirm` button.
8. Verify the income type is removed from the list.
9. Verify a success message `Income type deleted successfully` is displayed.
10. User navigates to the `add income` page.
11. Verify the deleted income type does not exist in the `income type` dropdown.
12. On the `view expense page`, verify any existing incomes of the deleted income type show the same label `wage` as the income type.
13. User clicks `Edit` action on existing income of the deleted income type. On `update income page`, verify selected income type label is same `wage` in income type dropdown.

## Expected Outcome:

- The confirmation dialog is displayed.
- The income type is removed from the list.
- A success message is displayed.
- The deleted income type does not appear in the `income type` dropdown.
- Existing incomes of the deleted income type show `wage` as the income type.

## Impact Area:

### Frontend

- View Income Type page
- Add Income page
- Edit Income page
- View Expenses page
- settings module
- income type component

### Backend API

- income type api

## Type of Test:

- End to End
- Demo site testable

## Tags:

- feature=`settings,income,expense`
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

- /api/settings/income-types/delete=1.44 sec

### Lambda:

#### delete income type

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
