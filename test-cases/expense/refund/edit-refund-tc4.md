---
id: edit-refund-tc4
title: Update Refund successful
execution: manual
created: 12/21/2024
updated: 02/13/2025
---

# Edit Refund - Success

## Title:

Editing refund successfully

## Description:

Logged in active user can update existing refund details successfully

## Preconditions:

User is logged in and active. User is `view expenses` page and there is at least 1 refund listed.

## Steps to Execute:

1. User clicks on `update refund` action from refund view `refund for local grocery store`
2. After few seconds of waiting, user is redirected to refund Edit form
3. Verify all fields are initialized with appropriate values of refund.
4. Verify 2 buttons, `update` and `cancel`, are displayed at the bottom of screen.
5. User updates details below,
   - bill name: change to `refund for snacks`
   - bill amount: change to `5`. verify `USA-USD` and `dollar symbol` is displayed to amount field.
   - payment account: dropdown is `cash` selected. unselect the item.
   - refund reason: dropdown is `costly` selected. change to `don't like`
   - tag person: if there is 1 selected, remove. if there isn't any, add 1.
   - description: clear the text.
   - tags: remove all tags
   - refund verified: click on verify indicator to change to verified.
   - refund date: leave it unchanged
   - upload receipt: verify message `1 receipt file is uploaded`. click on `upload /view receipts`.
     - a popup opens with thumbnail image view.
     - remove all uploaded receipts and verify message `there are no receipts`.
     - close the popup and verify message `no receipt uploaded` is displayed.
6. User clicks on `update` button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while refund is being updated.
- When successfully updated, the expense list is showing updated refund with filled out values.
- `view receipts` action is not showing for the refund.
- In small/mobile screen, it can be expanded. verify details

## Impact Area:

### frontend

- View Expenses page
- Edit Refund page
- navigation component
- expenses module
- refund component

### backend api

- expense count api
- expense api
- refund api
- refund reason api
- payment account api
- share person api
- refund tags api
- currency profile api
- refund receipt api
- purchase type api
- purchase api

## Type of Test:

- End to End
- Regression
- Demo site testable

## Tags:

- feature=`expense`
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

- api/stats/refund/get=1.24 sec

### Lambda:

#### edit refund

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
