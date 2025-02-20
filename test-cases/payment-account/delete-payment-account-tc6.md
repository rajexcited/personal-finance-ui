---
id: delete-payment-account-tc6
title: Delete Payment Account Successful
execution: manual
created: 12/21/2024
updated: 02/15/2025
---

# Delete Payment Account Successful

## Title:

Delete Payment Account Successful

## Description:

A logged-in and active user can delete an existing payment account (other than cash) successfully and verify the view list page is updated.

## Preconditions:

User is logged in and active. User is on the `view payment accounts` page. A payment account other than cash exists.

## Steps to Execute:

1. Verify the list of payment accounts is displayed.
2. User clicks on the `Delete` action link next to the payment account to be deleted.
3. A confirmation dialog appears asking the user to confirm the deletion.
4. User clicks on the `Confirm` button in the confirmation dialog.
5. After a few seconds of waiting, the `view payment accounts` page is reloaded.
6. Verify the deleted payment account is no longer displayed in the list of payment accounts.
7. Verify `cash` payment account exists. `Update` and `View/Expand` actions are displayed and clickable for `cash`
8. Verify `Update`, `Delete` and `View/Expand` actions are displayed and clickable for the remaining accounts.

## Expected Outcome:

- The confirmation dialog appears asking the user to confirm the deletion.
- The deleted payment account is no longer displayed in the list of payment accounts.
- The remaining payment accounts are displayed correctly with `Update`, `Delete` and `View/Expand` actions.

## Impact Area:

### Frontend

- View Payment Accounts page
- navigation component
- payment account module

### Backend API

- payment account api

## Type of Test:

- End to End
- Regression
- Demo site testable

## Tags:

- feature=`payment account`
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

- /api/payment-accounts/delete/post=1.44 sec
- /api/payment-accounts/get=1.44 sec

### Lambda:

#### delete payment account

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
