---
id: payment-account-ui-validations-tc3
title: Payment Account Form UI Validations
execution: manual
created: 02/15/2025
updated: 02/15/2025
---

# Payment Account Form - UI Validation

## Title:

Payment Account Form UI Validations

## Description:

Perform UI field validations on the payment account form.

## Preconditions:

The user is logged in and active. The user navigates to the `add payment account` page.

## Steps to Execute:

1. Verify all fields are empty or default initial value.
2. User clicks on the `add` button.
3. UI validation fails and unable to proceed with adding payment account:
   - **Short Name:** error `please fill out this field`
   - **Institution/Bank name:** error `please fill out this field`
   - **Account Number/Id:** error `please fill out this field`
   - **Account Type:** error `please select an item from dropdown`
4. User enters `Short Name` value to `a` but gets error message `Please lengthen this text to 2 characters or more (you are currently using 1 character).`
5. User tries to add below 11 tags and gets error counter 10.
   - primary
   - secondary
   - savings
   - checking
   - business one
   - personal
   - joint
   - salary
   - investment
   - emergency fund
6. Verify The space in tag value is converted to dash format.
7. There is no tag person list. User tries to add on the fly. But user can't select or add, and input field shows what user typed.
8. User tries to fill Short Name with `primary "account"` and gets error message.
9. User clicks on the `cancel` button.

## Expected Outcome:

- Verify all UI validation errors on fields.
- When the user clicks on the cancel button, the user is navigated to the `view payment accounts` page.

## Impact Area:

### Frontend

- Add Payment Account page
- Edit Payment Account page
- navigation component
- payment account module

### Backend API

- payment account api
- payment account tags api
- payment account type api
- currency profile api

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`payment account`
- execution=`manual`
- impact=`medium`
- type=`negative`
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

### Lambda:

## Notes/Comments:

Any additional information or considerations.
