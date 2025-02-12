---
id: edit-income-tc3
title: Update Income successful
execution: manual
created: 12/21/2024
updated: 02/11/2025
---

# Edit Income - Success

## Title:

Update Income successful

## Description:

Logged in active user can update existing income details successfully

## Preconditions:

User is logged in and active. User is `view expenses` page and there is at least 1 income listed.

## Steps to Execute:

1. User clicks on `update income` action from income view `local grocery store`
2. After few seconds of waiting, user is redirected to income Edit form
3. Verify all fields are initialized with appropriate values of income.
4. Verify 2 buttons, `update` and `cancel`, are displayed at the bottom of screen.
5. User updates details below,
   - income name: change to `primary job`
   - income amount: change to `2100`. verify `USA-USD` and `dollar symbol` is displayed to amount field.
   - payment account: dropdown is `cash` selected. unselect the item.
   - income type: dropdown is `salary` selected. change to `passive income`
   - tag person: if there is 1 selected, remove. if there isn't any, add 1.
   - description: clear the text.
   - tags: remove all tags
   - income verified: click on verify indicator to change to verified.
   - income date: leave it unchanged
   - upload receipt: verify message `1 receipt file is uploaded`. click on `upload /view receipts`.
     - a popup opens with thumbnail pdf view.
     - remove all uploaded receipts and verify message `there are no receipts`.
     - close the popup and verify message `no receipt uploaded` is displayed.
6. User clicks on `update` button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while income is being updated.
- When successfully updated, the expense list is showing updated income with filled out values.
- `view receipts` action is not showing for the income.
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

- End to End
- Regression
- Demo site testable

## Tags:

- feature=`expenses`
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

#### network calls:

- index.html=450 ms

### Lambda:

#### edit income

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
