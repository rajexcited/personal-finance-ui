---
id: add-purchase-tc1
---

# Add Purchase - Success

## Title:

Add purchase successfully

## Description:

logged in active user can submit new purchase

## Preconditions:

user is logged in and active. expense view list page is launched

## Steps to Execute:

1. user clicks on `add purchase` button
2. after few seconds of waiting, user is redirected to purchase add form
3. verify all fields are empty or default initialized.
4. there are 2 buttons, `add` and `cancel`, are displayed at the bottom of screen.
5. user fills out below details,
   - bill name: `local grocery store`
   - bill amount: `123`. verify `USA-USD` and `dollar symbol` is displayed to amount field.
   - payment account: dropdown select is displayed. verify atleast item `cash` exists. choose `cash`
   - purchase type: dropdown select is displayed with error `please select an item from dropdown`. there are list of default values displayed. choose `food shopping`.
   - tag person: verify this is empty and counter is 0. if there is any available to choose one person, otherwise leave empty.
   - description: fill out `I am shopping food items from nearby grcerystore`
   - tags: verify this is empty and counter is 0. enter and select `inviting`
   - purchase verified: verified the indicator is `purchase un-verified`. leave this default value.
   - purchase date: verify the date is today. select previous week.
   - upload receipt: verify message `no receipt uploaded` is displayed.
     - when click on `upload receipt` button, a popup opens having button and message `there are no receipts`.
     - click on button and choose an jpeg image. now the image is viewable with name. upon clicking on image it opens in fullscreen.
     - close the popup
   - click and expand `break into purchase items`. verify item count is 0 and all fields in row are empty.
6. click on `add` button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while purchase is being added.
- when successfully added, the expense list is showing new added purchase with filled out values.
- `view receipts` and `add refund` actions exist for the purchase.
- in small screen, it can be expanded, verify details

## Impact Area:

### frontend

- expense page
- add purchase form

### backend api

- expense list api
- purchase type api
- payment account api
- share person api
- purchase tags api
- purchase api post

## Type of Test:

- Integration
- Regression
- Demo site testable

## Tags:

- feature=`expense,purchase,add`
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
