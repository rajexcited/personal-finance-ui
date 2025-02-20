---
id: add-payment-account-tc2
title: Add Payment Account Successful
execution: manual
created: 12/21/2024
updated: 02/15/2025
---

# Add Payment Account Successful

## Title:

Add payment account Successful

## Description:

A logged-in and active user can add a new payment account successfully.

## Preconditions:

User is logged in and active. User is on the `view payment accounts` page.

## Steps to Execute:

1. Verify the `add payment account` button is displayed.
2. User clicks on the `add payment account` button.
3. After a few seconds of waiting, the user is redirected to the payment account add form.
4. Verify the add payment account form is displayed with necessary input fields:
   - **Short Name:** empty
   - **Institution/Bank name:** empty
   - **Amount Symbol:** default initialized to `USA-USD`
   - **Account Number/Id:** empty
   - **Account Type:** dropdown `select` is displayed with error `please select an item from dropdown`. There is a list of default values displayed. Verify the list matches with all enabled payment account types.
   - **Tags:** empty and counter is 0/10
   - **Description:** empty and counter is 0/150
5. Verify 2 buttons, `add` and `cancel`, are displayed at the bottom of the screen.
6. User fills out the details as follows:
   - **Short Name:** primary 1234
   - **Institution/Bank name:** USA Federal
   - **Account Number/Id:** 1234
   - **Account Type:** choose `checking`
   - **Tags:** enter and select `primary`, `single`, `job salary`
   - **Description:** fill out `Primary account for salary deposits`
7. User clicks on the `add` button.
8. After a few seconds of waiting, the user is redirected to the `view payment account` page.
9. Verify the new payment account is added to the list of payment accounts.
10. Verify `Update`, `Delete` and `View/Expand` actions are displayed and clickable.
11. Verify the new payment account details are displayed correctly in view.

## Expected Outcome:

- The add payment account form is displayed with necessary input fields.
- The new payment account is added to the list of payment accounts.
- The new payment account details are displayed correctly in the list.

## Impact Area:

### Frontend

- Add Payment Account page
- navigation component
- payment account module

### Backend API

- payment account api
- payment account tags api
- payment account type api
- currency profile api

## Type of Test:

- End to End
- Regression
- Demo site testable

## Tags:

- feature=`payment account`
- execution=`manual`
- impact=`high`
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

- /api/payment-accounts/add/post=1.44 sec

### Lambda:

#### add payment account

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

#### get payment account types

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

#### get currency profile

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
