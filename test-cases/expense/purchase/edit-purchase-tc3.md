---
id: edit-purchase-tc3
title: Update Purchase successful
execution: manual
created: 12/21/2024
updated: 02/12/2025
---

# Edit Purchase - Success

## Title:

Edit purchase successfully

## Description:

Logged in active user can update existing purchase details successfully

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
   - payment account: dropdown is `cash` selected. unselect the item.
   - purchase type: dropdown is `food shopping` selected. change to `home stuff`
   - tag person: if there is 1 selected, remove. if there isn't any, add 1.
   - description: clear the text.
   - tags: remove all tags
   - purchase verified: click on verify indicator to change to verified.
   - purchase date: leave it unchanged
   - upload receipt: verify message `1 receipt file is uploaded`. click on `upload /view receipts`.
     - a popup opens with thumbnail image view.
     - remove all uploaded receipts and verify message `there are no receipts`.
     - close the popup and verify message `no receipt uploaded` is displayed.
   - click and expand `break into purchase items`. verify item count is 0 and all fields in row are empty.
   - enter item name to `snacks`, amount to `4.5`, purchase type to `food shopping`, tags to `daily, brakfast`
6. User clicks on `update` button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while purchase is being updated.
- When successfully updated, the expense list is showing updated purchase with filled out values.
- `view receipts` action is not showing for the purchase.
- In small/mobile screen, it can be expanded. verify details

## Impact Area:

### frontend

- View Expenses page
- Edit Purchase page
- navigation component
- expenses module
- purchase component
- upload receipts

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

- index.html=450 ms

### Lambda:

#### edit purchase

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
