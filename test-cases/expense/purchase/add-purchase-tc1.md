---
id: add-purchase-tc1
title: Add Purchase successful
execution: manual
created: 12/21/2024
updated: 02/12/2025
---

# Add Purchase - Successful

## Title:

Add purchase successful

## Description:

Logged in active user can add purchase successfully.

## Preconditions:

User is logged in and active. User is on `view expenses` page.

## Steps to Execute:

1. Verify `add purchase` button is displayed.
2. User clicks on `add purchase` button.
3. After a few seconds of waiting, user is redirected to the purchase add form.
4. Verify add purchase page is displayed with necessary input fields:
   - **bill name:** empty
   - **amount symbol:** default initialized to `USA-USD`
   - **bill amount:** empty
   - **payment account:** dropdown select is displayed with error `please select an item from dropdown`. Verify at least one item `cash` exists.
   - **purchase type:** dropdown select is displayed with error `please select an item from dropdown`. There are a list of default values displayed. Verify the list matches with all enabled purchase types.
   - **tag person:** empty and counter is 0/10.
   - **tags:** empty and counter is 0/10.
   - **description:** empty and counter is 0/150
   - **purchase verified:** verified the indicator is `purchase un-verified`.
   - **purchase date:** today is selected.
   - **upload receipt:** verify message `no receipt uploaded` is displayed. When clicking on `upload receipt` button, a popup opens having button and message `there are no receipts`.
   - **Break into purchase items:** verify it is closed. verify expand action is displayed. Verify item count is 0. If expanded, there is a row displayed with empty necessary fields.
5. Verify 2 buttons, `add` and `cancel`, are displayed at the bottom of screen.
6. User fills out below details,
   - **bill name:** `local grocery store`
   - **bill amount:** `123`. verify `USA-USD` and `dollar symbol` is displayed to amount field.
   - **payment account:** choose `cash`
   - **purchase type:** choose `food shopping`.
   - **tag person:** if there is any available to choose one person, otherwise leave empty.
   - **tags:** enter and select `inviting`
   - **description:** fill out `I am shopping food items from nearby grcerystore`
   - **purchase verified:** do no change. leave this default value.
   - **purchase date:** select previous week.
   - **upload receipt:**
     - click on button and choose an jpeg image.
     - now the image is viewable with name.
     - upon clicking on image it opens in fullscreen.
     - close the popup
   - **Break into purchase items:** click and expand. fill out row
     - bill name: `snacks`
     - bil amount: `25.5`
     - purchase type: select `snacks`
7. User clicks on `add` button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while purchase is being added.
- When successfully added, the expense list is showing new added purchase with filled out values.
- `view receipts` and `add refund` actions exist for the purchase.
- In small/mobile screen, it can be expanded, verify details

## Impact Area:

### frontend

- View Expenses page
- Add Purchase page
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

- feature=`expense,purchase`
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

#### add purchase

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
