---
id: add-refund-tc2
labels: [test-scenario, impact-medium, regression, positive, expense, refund, add]
---

# Add Refund from purchase

## Title:

Add refund from purchase

## Description:

logged in active user can submit new refund from purchase

## Preconditions:

user is logged in and active. expense view list page is launched with at least 1 purchase

## Steps to Execute:

1. user clicks on `add refund` action from purchase `local grocery store`
2. after few seconds of waiting, user is redirected to refund add form
3. verify all fields are default initialized through purchase values.
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
4. verify 2 buttons, `add` and `cancel`, are displayed at the bottom of screen.
5. user changes below details,
   - refund amount: `13`. verify `USA-USD` and `dollar symbol` is displayed to amount field.
   - refund reason: choose `costly`.
   - description: fill out `I am returning the costly items to grocery store`
   - refund date: select yesterday.
   - upload receipt:
     - click on button and choose an png image. now the image is viewable with name. upon clicking on image it opens in fullscreen.
     - close the popup
6. click on `add` button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while refund is being added.
- when successfully added, the expense list is showing new added refund with filled out values.
- `add refund` action exist for the refund.
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
- refund api post.

## Type of Test:

- Integration
- Regression
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
