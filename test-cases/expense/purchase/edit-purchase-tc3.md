---
id: edit-purchase-tc3
---

# Edit Purchase - Success

## Title:

Edit purchase successfully

## Description:

active user can update existing purchase details

## Preconditions:

user is logged in and active. expense view list page is launched with at least 1 purchase

## Steps to Execute:

1. user clicks on `update purchase` action from purchase view `local grocery store`
2. after few seconds of waiting, user is redirected to purchase Edit form
3. verify all fields are initialized with appropriate values of purchase.
4. there are 2 buttons, `update` and `cancel`, are displayed at the bottom of screen.
5. user updates details below,
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
6. click on `update` button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while purchase is being updated.
- when successfully updated, the expense list is showing updated purchase with filled out values.
- `view receipts` action is not showing for the purchase.
- in small screen, it can be expanded. verify details

## Impact Area:

### frontend

- expense page
- update purchase form

### backend api

- expense list api
- purchase type api
- payment account api
- share person api
- purchase api get
- purchase tags api
- purchase api post

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`expense,purchase,edit`
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
