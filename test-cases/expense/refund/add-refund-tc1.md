---
id: add-refund-tc1
---

# Add Refund without purchase selection

## Title:

Add refund without selecting purchase

## Description:

logged in active user can submit new refund and not select the purchase

## Preconditions:

user is logged in and active. expense view list page is launched

## Steps to Execute:

1. user clicks on `add refund` button
2. after few seconds of waiting, user is redirected to refund add form
3. verify all fields are empty or default initialized.
4. there are 2 buttons, `add` and `cancel`, are displayed at the bottom of screen.
5. user fills out below details,
   - bill name: `my refund`
   - refund amount: `11`. verify `USA-USD` and `dollar symbol` is displayed to amount field.
   - payment account: dropdown select is displayed. verify atleast item `cash` exists. choose `cash`
   - refund reason: dropdown select is displayed with error `please select an item from dropdown`. there are list of default values displayed. choose `costly`.
   - tag person: verify this is empty and counter is 0. if there is any available to choose one person, otherwise leave empty.
   - description: fill out `I have return some costly items to store`
   - tags: verify this is empty and counter is 0. enter and select `inviting`
   - refund verified: verified the indicator is `refund un-verified`. leave this default value.
   - refund date: verify the date is today. select yesterday.
   - upload receipt: verify message `no receipt uploaded` is displayed.
     - when click on `upload receipt` button, a popup opens having button and message `there are no receipts`.
     - click on button and choose an png image. now the image is viewable with name. upon clicking on image it opens in fullscreen.
     - close the popup
6. click on `add` button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while refund is being added.
- when successfully added, the expense list is showing new added refund with filled out values.
- `view receipts` action exist for the refund.
- in small screen, it can be expanded, verify details

## Impact Area:

### frontend

- expense page
- add refund form

### backend api

- expense list api
- refund reason api
- payment account api
- share person api
- refund tags api
- refund api post

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`expense,refund,add`
- execution=`manual`
- impact=`high`
- type=`positive`

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
- api/user/login/post=1.8 sec
- api/user/details/get=2.3 sec
- api/stats/purchase/get=1.44 sec
- api/stats/refund/get=1.24 sec
- api/stats/income/get=768 ms

### Lambda:

#### user-login

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
