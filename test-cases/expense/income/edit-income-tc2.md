---
id: edit-income-tc2
title: Attempt to Update Income, but Cancel
execution: manual
created: 12/21/2024
updated: 02/11/2025
---

# Edit Income - cancel

## Title:

Attempt to Update Income, but cancel

## Description:

Logged in active user tries to update existing income details, but cancels and income details are not saved

## Preconditions:

User is logged in and active. User is `view expenses` page and there is at least 1 income listed.

## Steps to Execute:

1. User clicks on `update income` action from income view `primary job`
2. After few seconds of waiting, user is redirected to income Edit form
3. Verify all fields are initialized with appropriate values of income.
4. Verify 2 buttons, `update` and `cancel`, are displayed at the bottom of screen.
5. User updates details below,
   - income name: change to `secondary job`
   - income amount: change to `2100`. verify `USA-USD` and `dollar symbol` is displayed to amount field.
   - income verified: click on verify indicator to change to verified.
   - income date: change to 1 month backword.
6. User clicks on `cancel` button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~1) while income is being cancel.
- On successful, the expense list is showing with no changes to income details.
- `view receipts` action is still showing for the income.
- In small/mobile screen, it can be expanded. verify details

## Impact Area:

### frontend

- View Expenses page
- Edit Income page
- navigation component
- expenses module
- income component

### backend api

- expense count api
- expense api
- income api
- income type api
- payment account api
- share person api
- income tags api
- currency profile api
- income receipt api

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`expense,income`
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
