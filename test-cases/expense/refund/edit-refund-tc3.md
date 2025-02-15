---
id: edit-refund-tc3
title: Attempt to Update Refund, but Cancel
execution: manual
created: 12/21/2024
updated: 02/13/2025
---

# Edit Refund - Cancel

## Title:

Attempt to Update Refund, but cancel

## Description:

Logged in active user tries to update existing refund details, but cancels and refund details are not saved

## Preconditions:

User is logged in and active. User is `view expenses` page and there is at least 1 refund listed.

## Steps to Execute:

1. User clicks on `update refund` action from refund view `local grocery store`
2. After few seconds of waiting, user is redirected to refund Edit form
3. Verify all fields are initialized with appropriate values of refund.
4. Verify 2 buttons, `update` and `cancel`, are displayed at the bottom of screen.
5. User updates details below,
   - bill name: change to `refund all`
   - refund amount: change to `100`. verify `USA-USD` and `dollar symbol` is displayed to amount field.
   - refund verified: click on verify indicator to change to verified.
   - refund date: change to 1 month backword.
6. User changes the purchase to different one. verify field values are not modified, but info is updated approprite to selected purchase.
7. User clicks on `cancel` button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~1) while refund is being cancel.
- On successful, the expense list is showing with no changes to refund details.
- `view receipts` action is still showing for the refund.
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
- purchase api
- purchase type api
- payment account api
- share person api
- refund tags api
- currency profile api
- refund receipt api

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`expense,refund`
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
