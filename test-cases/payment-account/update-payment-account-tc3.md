---
id: update-payment-account-tc3
title: Update Payment Account Successful
execution: manual
created: 12/21/2024
updated: 02/15/2025
---

# Update Payment Account Successful

## Title:

Update Payment Account Successful

## Description:

A logged-in and active user can update an existing payment account successfully.

## Preconditions:

User is logged in and active. User is on the `view payment accounts` page. A payment account exists.

## Steps to Execute:

1. Verify the list of payment accounts is displayed.
2. User clicks on the `Update` button next to the payment account to be updated.
3. After a few seconds of waiting, the user is redirected to the payment account update form.
4. Verify the update payment account form is displayed with the current details of the payment account:
   - **Short Name:** pre-filled value
   - **Institution/Bank name:** pre-filled value
   - **Amount Symbol:** pre-filled value
   - **Account Number/Id:** pre-filled value
   - **Account Type:** pre-filled selected type
   - **Tags:** pre-filled values
   - **Description:** pre-filled value
5. Verify 2 buttons, `update` and `cancel`, are displayed at the bottom of the screen.
6. User updates the details as follows:
   - **Short Name:** `primary 5678`
   - **Institution/Bank name:** `USA National`
   - **Account Number/Id:** 5678
   - **Account Type:** choose `savings`
   - **Tags:** enter and select `primary`, `savings`, `emergency fund`
   - **Description:** fill out `Primary savings account for emergency funds`
7. User clicks on the `update` button.
8. After a few seconds of waiting, the user is redirected to the `view payment account` page.
9. Verify the updated payment account details are displayed correctly in the list of payment accounts.
10. Verify `Update`, `Delete` and `View/Expand` actions are displayed and clickable.
11. Verify the updated payment account details are displayed correctly in view.

## Expected Outcome:

- The update payment account form is displayed with the current details of the payment account.
- The updated payment account details are displayed correctly in the list of payment accounts.
- The updated payment account details are displayed correctly in view.

## Impact Area:

### Frontend

- Edit Payment Account page
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

- /api/payment-accounts/update/post=1.44 sec

### Lambda:

#### update payment account

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
