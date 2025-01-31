---
id: edit-purchase-tc2
---

# Edit Purchase - cancel

## Title:

Edit purchase and cancel

## Description:

active user tried to update existing purchase details, but cancels

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
   - purchase verified: click on verify indicator to change to verified.
   - purchase date: change to 1 month backword.
6. click on `cancel` button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~1) while purchase is being cancel.
- on successful, the expense list is showing with no changes to purchase details.
- `view receipts` action is still showing for the purchase.
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

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`expense,purchase,edit`
- execution=`manual`
- impact=`medium`
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
