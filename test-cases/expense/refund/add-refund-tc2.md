---
id: add-refund-tc2
title: Add Refund successful with purchase
execution: manual
created: 12/21/2024
updated: 02/12/2025
---

# Add Refund from purchase

## Title:

Add refund with purchase

## Description:

Logged in active user can add refund with purchase successfully

## Preconditions:

User is logged in and active. User is on `view expenses` page and there is at least 1 purchase listed.

## Steps to Execute:

1. User clicks on `add refund` action from purchase `local grocery store`
2. After few seconds of waiting, user is redirected to refund add form
3. Verify all fields are default initialized through purchase values.
   - verify purchase dropdown is selected to purchase. and verify `quickview` link is displayed.
   - when clicked on `quickview` purchase details are displayed
   - bill name is pre-populated to `Refund for local grocery store` and info is displayed below bill name field
   - refund amount is pre-populated to `purchase amount` value `123`. and info is displayed below refund amount field
   - payment account is pre-selected to `purchase payment account` to `cash` and info is displayed below payment account dropdown.
   - refund reason is empty with error message `please select an item from dropdown`. there are list of default values displayed.
   - tag person is empty since purchase tag person is empty. but info is displayed below tag person field.
   - description is empty.
   - tags are pre-populated as purchase tags to `inviting`. and info is displayed below tags field.
   - refund verified: verified the indicator is `refund un-verified`. leave this default value.
   - refund date is today.
   - verify message next to upload receipt `no receipt uploaded`. when click on `upload receipt` button, a popup opens having button and message `there are no receipts`.
4. Verify 2 buttons, `add` and `cancel`, are displayed at the bottom of screen.
5. User changes below details,
   - refund amount: `13`. verify `USA-USD` and `dollar symbol` is displayed to amount field.
   - refund reason: choose `costly`.
   - description: fill out `I am returning the costly items to grocery store`
   - refund date: select yesterday.
   - upload receipt:
     - click on button and choose an png image. now the image is viewable with name. upon clicking on image it opens in fullscreen.
     - close the popup
6. User clicks on `add` button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while refund is being added.
- When successfully added, the expense list is showing new added refund with filled out values.
- `add refund` action exist for the refund.
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
- purchase api
- purchase type api

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

- index.html=450 ms

### Lambda:

#### add refund

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
