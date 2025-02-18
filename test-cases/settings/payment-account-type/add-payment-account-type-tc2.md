---
id: add-payment-account-type-tc2
title: Add Payment Account Type
execution: manual
created: 12/21/2024
updated: 02/15/2025
---

# Add Payment Account Type

## Title:

Add Payment Account Type

## Description:

A logged-in and active user can add a new payment account type

## Preconditions:

User is logged in and active. User is on the `view payment account type` page.

## Steps to Execute:

1. User clicks on the `Add` button.
2. Verify the `Add Payment Account Type` form is displayed with necessary input fields:
   - **Name:** empty
   - **Status:** toggle switch (enabled by default)
   - **Color:** color picker with default color
   - **Description:** empty and counter is 0/400
   - **Tags:** empty and counter is 0/10
3. Verify 2 buttons, `save` and `cancel`, are displayed.
4. User fills in the form fields:
   - **Name:** Checking Account
   - **Color:** green
   - **Description:** `Personal checking account` and counter is 25/400
   - **Tags:** `checking, personal` and counter is 2/10
5. User clicks on the `Save` button.
6. Verify the new payment account type is added to the list with the correct details.
7. User navigated `add Payment Account` page
8. Verify `Checking Account` exists in `payment account type` dropdown

## Expected Outcome:

- The `Add Payment Account Type` form is displayed.
- The new payment account type is added to the list with the correct details and can be seen in enabled list.

## Impact Area:

### Frontend

- View Payment Account Type page
- Add Payment Account Type page
- Add Payment Account page
- Edit Payment Account page
- settings module
- payment account type component
- Payment Account component

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
- devices=`desktop`

## Affected Versions:

v0.1.0

## Attachments:

Screenshots

## Average Performance Time:

### Test:

total=1 min

### Browser:

#### Network calls:

- /api/settings/payment-account-types/add=1.44 sec

### Lambda:

#### add payment account type

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
