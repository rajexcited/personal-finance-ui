---
id: delete-payment-account-type-tc5
title: Delete Payment Account Type
execution: manual
created: 12/21/2024
updated: 02/15/2025
---

# Delete Payment Account Type

## Title:

Delete Payment Account Type

## Description:

A logged-in and active user can delete an existing payment account type.

## Preconditions:

User is logged in and active. User is on the `view payment account type` page. A payment account type exists. A payment account exists of payment account type `Product Return`

## Steps to Execute:

1. User clicks on the `Delete` action from ellipsis next to an existing payment account type `Checking Account`.
2. Verify a confirmation dialog is displayed with the message `Are you sure you want to delete this payment account type?`.
3. Verify 2 buttons, `confirm` and `cancel`, are displayed in the confirmation dialog.
4. User clicks on the `Cancel` button.
5. Verify the payment account type is not removed from the list.
6. repeat steps 1, 2 and 3.
7. User clicks on the `Confirm` button.
8. Verify the payment account type is removed from the list.
9. Verify a success message `Payment Account Type deleted successfully` is displayed.
10. User navigates to the `add payment account` page.
11. Verify the deleted payment account type does not exist in the `payment account type` dropdown.
12. On the `view payment account page`, verify any existing payment accounts of the deleted payment account type show the same label `Checking Account` as the payment account type.
13. User clicks `Edit` action on existing payment account of the deleted payment account type. On `update payment account page`, verify selected payment account type label is same `Product Return` in payment account type dropdown.

## Expected Outcome:

- The confirmation dialog is displayed.
- The payment account type is removed from the list.
- A success message is displayed.
- The deleted payment account type does not appear in the `payment account type` dropdown.
- Existing payment accounts of the deleted payment account type show `Checking Account` as the payment account type.

## Impact Area:

### Frontend

- View Payment Account Type page
- Add Payment Account page
- Edit Payment Account page
- View Payment Account page
- settings module
- payment account type component

### Backend API

- payment account type api

## Type of Test:

- End to End
- Demo site testable

## Tags:

- feature=`settings,payment account`
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

- /api/settings/payment-account-types/delete=1.44 sec

### Lambda:

#### delete payment account type

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
