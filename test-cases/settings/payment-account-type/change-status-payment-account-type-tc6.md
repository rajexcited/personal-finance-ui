---
id: change-status-payment-account-type-tc6
title: Change to Disabled Status of Payment Account Type
execution: manual
created: 12/21/2024
updated: 02/18/2025
---

# Change to Disabled Status of Payment Account Type

## Title:

Change to Disabled Status of Payment Account Type

## Description:

A logged-in and active user can change the status of an existing payment account type.

## Preconditions:

User is logged in and active. User is on the `view payment account type` page. An payment account type `Checking Account` exists with `enabled` status. A payment account exists of payment account type `Checking Account`.

## Steps to Execute:

1. User clicks on the `Change to disable` action from ellipsis next to an existing payment account type `Checking Account`.
2. Verify list of payment account type is updated.
3. when toggler `Filtered By enabled` ON, verify the payment account type `Checking Account` is not in the list.
4. when toggler `All types` ON, verify the payment account type `Checking Account` is in the list. Verify the status is changed to disabled.
5. User navigates to the `add payment account` page.
6. Verify the payment account type `Checking Account` does not exist in the `payment account type` dropdown.
7. On the `view payment account page`, verify any existing payment accounts of the disabled payment account type show the same label `Checking Account` as the payment account type.
8. User clicks `Edit` action on existing payment account of payment account type `Checking Account`. On `update payment account page`, verify selected payment account type label is same `Checking Account` in payment account type dropdown.

## Expected Outcome:

- The status of the payment account type is changed.
- The updated status of the payment account type appears in the `payment account type` dropdown.
- Existing payment accounts of the payment account type show no change.

## Impact Area:

### Frontend

- View Payment Account Type page
- Add Payment Account page
- Edit Payment Account page
- View Expenses page
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

- /api/settings/payment-account-types/change-status=1.44 sec

### Lambda:

#### change status payment account type

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
