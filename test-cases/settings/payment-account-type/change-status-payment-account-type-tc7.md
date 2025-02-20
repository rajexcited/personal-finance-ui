---
id: change-status-payment-account-type-tc7
title: Change to Enabled Status of Payment Account Type
execution: manual
created: 12/21/2024
updated: 02/18/2025
---

# Change to Enabled Status of Payment Account Type

## Title:

Change to Enabled Status of Payment Account Type

## Description:

A logged-in and active user can change the status of an existing payment account type.

## Preconditions:

User is logged in and active. User is on the `view payment account type` page. An payment account type `Checking Account` exists with `disabled` status. and toggler `All types` is ON.

## Steps to Execute:

1. User clicks on the `Change to enable` action from ellipsis next to an existing payment account type `Checking Account`.
2. Verify list of payment account type is updated.
3. Verify the status of payment account type `Checking Account` is changed in the list.
4. When toggler `Filtered By enabled` is ON, verify the payment account type `Checking Account` is still in the list.
5. Verify the payment account type `Checking Account` exists in the `payment account type` dropdown for `add or update` payment account page.

## Expected Outcome:

- The status of the payment account type is changed.
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
