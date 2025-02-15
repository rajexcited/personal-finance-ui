---
id: edit-purchase-tc2
title: Attempt to Update Purchase, but Cancel
execution: manual
created: 12/21/2024
updated: 02/12/2025
---

# Edit Purchase - cancel

## Title:

Attempt to Update Purchase, but cancel

## Description:

Logged in active user tries to update existing purchase details, but cancels and purchase details are not saved

## Preconditions:

User is logged in and active. User is `view expenses` page and there is at least 1 purchase listed.

## Steps to Execute:

1. User clicks on `update purchase` action from purchase view `local grocery store`
2. After few seconds of waiting, user is redirected to purchase Edit form
3. Verify all fields are initialized with appropriate values of purchase.
4. Verify 2 buttons, `update` and `cancel`, are displayed at the bottom of screen.
5. User updates details below,
   - bill name: change to `local grocery store further`
   - bill amount: change to `12.3`. verify `USA-USD` and `dollar symbol` is displayed to amount field.
   - purchase verified: click on verify indicator to change to verified.
   - purchase date: change to 1 month backword.
6. User clicks on `cancel` button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~1) while purchase is being cancel.
- On successful, the expense list is showing with no changes to purchase details.
- `view receipts` action is still showing for the purchase.
- In small/mobile screen, it can be expanded. verify details

## Impact Area:

### frontend

- View Expenses page
- Edit Purchase page
- navigation component
- expenses module
- purchase component

### backend api

- expense count api
- expense api
- purchase api
- purchase type api
- payment account api
- share person api
- purchase tags api
- currency profile api
- purchase receipt api

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`expense,purchase`
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

#### network calls:

### Lambda:

## Notes/Comments:

Any additional information or considerations.
