---
id: add-refund-tc1
title: Add Refund successful without purchase
execution: manual
created: 12/21/2024
updated: 02/12/2025
---

# Add Refund without purchase selection

## Title:

Add refund without selecting purchase

## Description:

Logged in active user can add refund without selecting the purchase successfully

## Preconditions:

User is logged in and active. User is on `view expenses` page.

## Steps to Execute:

1. Verify `add refund` button is displayed
2. User clicks on `add refund` button
3. After few seconds of waiting, user is redirected to refund add form
4. Verify add refund page is displayed with necessary input fields:
   - **bill name:** empty
   - **amount symbol:** default initialized to `USA-USD`
   - **refund amount:** empty
   - **payment account:** dropdown select is displayed with error `please select an item from dropdown`. verify atleast item `cash` exists.
   - **refund reason:** dropdown select is displayed with error `please select an item from dropdown`. there are list of default values displayed. Verify the list matches with all enabled refund reasons.
   - **tag person:** empty and counter is 0/10.
   - **tags:** empty and counter is 0/10.
   - **description:** empty and counter is 0/150
   - **refund verified:** verified the indicator is `refund un-verified`.
   - **refund date:** today is selected.
   - **upload receipt:** verify message `no receipt uploaded` is displayed. when clicking on `upload receipt` button, a popup opens having button and message `there are no receipts`.
5. Verify 2 buttons, `add` and `cancel`, are displayed at the bottom of screen.
6. User fills out below details,
   - **bill name:** `my refund`
   - **refund amount:** `11`
   - **payment account:** choose `cash`
   - **refund reason:** choose `costly`.
   - **tag person:** if there is any available to choose one person, otherwise leave empty.
   - **tags:** enter and select `inviting`
   - **description:** fill out `I have return some costly items to store`
   - **refund verified:** do not change. leave this default value.
   - **refund date:** select yesterday.
   - **upload receipt:**
     - click on button and choose an png image.
     - now the image is viewable with name.
     - upon clicking on image it opens in fullscreen.
     - close the popup
7. User clicks on `add` button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while refund is being added.
- When successfully added, the expense list is showing new added refund with filled out values.
- `view receipts` action exist for the refund.
- In small/mobile screen, it can be expanded, verify details

## Impact Area:

### frontend

- View Expenses page
- Add Refund page
- navigation component
- expenses module
- refund component
- upload receipts

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

## Type of Test:

- End to End
- Regression
- Demo site testable

## Tags:

- feature=`expense,refund`
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

- /api/expenses/count?pageNo=1&status=enable&pageMonths=2&belongsTo=purchase/get=3.54 sec
- /api/expenses?pageNo=1&status=enable&pageMonths=2&belongsTo=purchase/get=1.88 sec
- /api/expenses/refund/id/<refund-id>/receipts/id/<receipt-id>/post=925 ms
- /api/expenses/refund/post=2.74 sec
- /api/expenses/count?pageNo=1&status=enable&pageMonths=6/get=808 ms

### Lambda:

#### get purchase list (pageNo=1, status=enable)

- invocation in 15 min=1
- memory size=128 MB
- memory used=104 MB
- bill duration=959 ms
- init duration=654 ms

#### add refund

- invocation in 15 min=1
- memory size=128 MB
- memory used=104 MB
- bill duration=1739 ms
- init duration=657 ms

#### get purchase count (pageNo=1, status=enable, pageMonths=2, belongsTo=purchase) same lambda invoked below

- invocation in 15 min=2
- memory size=128 MB
- memory used=104 MB
- bill duration=829 ms
- init duration=629 ms

#### get expense count (pageNo=1, status=enable, pageMonths=6) same lambda invoked

- memory size=128 MB
- memory used=104 MB
- bill duration=657 ms
- init duration=0 ms

## Notes/Comments:

Any additional information or considerations.
