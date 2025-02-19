---
id: update-payment-account-type-tc3
title: Update Payment Account Type
execution: manual
created: 12/21/2024
updated: 02/15/2025
---

# Update Payment Account Type

## Title:

Update Payment Account Type

## Description:

A logged-in and active user can update an existing payment account type.

## Preconditions:

User is logged in and active. User is on the `view payment account type` page. A payment account type exists. A payment account exists of payment account type `Checking Account`

## Steps to Execute:

1. User clicks on the `Edit` action from ellipsis next to an existing payment account type.
2. Verify the `Edit Payment Account Type` form is displayed with the current details of the payment account type:
   - **Name:** Checking Account
   - **Status:** toggle switch pre-selected to `enable`
   - **Color:** color picker with pre-filled `green`
   - **Description:** `Personal checking account` and counter is 12/400
   - **Tags:** `checking, personal` and counter is 2/10
3. Verify 2 buttons, `save` and `cancel`, are displayed.
4. User updates the form fields:
   - **Name:** Checking Account Updated
   - **Status:** toggle switch pre-selected to `disable`
   - **Color:** blue
   - **Description:** `Updated description for Personal checking account` and counter is 48/400
   - **Tags:** `checking, personal, updated` and counter is 3/10
5. User clicks on the `Save` button.
6. Verify the updated payment account type is displayed in the list with the correct details.
7. User clicks on `View` button for `Checking Account Updated`. verify details shown.
8. User navigated `add payment account` page
9. Verify `Checking Account Updated` exists in `payment account type` dropdown
10. On `view payment account page`, verify existing payment account is showing updated payment account type name `Checking Account Updated`
11. User clicks `Edit` action on existing payment account. On `update payment account page`, verify selected payment account type label is updated.

## Expected Outcome:

- The `Edit Payment Account Type` form is displayed.
- The updated payment account type is displayed in the list with the correct details.
- The updated payment account type is displayed in view payment account, add payment account and edit payment account pages.

## Impact Area:

### Frontend

- View Payment Account Type page
- Edit Payment Account Type page
- Add Payment Account page
- Edit Payment Account page
- View Payment Account page
- settings module
- payment account type component

### Backend API

- payment account type api
- payment account type tags api

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

- /api/settings/payment-account-types/update=1.44 sec

### Lambda:

#### update payment account type

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
