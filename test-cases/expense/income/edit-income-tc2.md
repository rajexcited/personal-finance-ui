---
id: edit-income-tc2
---

# Edit Income - cancel

## Title:

Edit income and cancel

## Description:

active user tried to update existing income details, but cancels

## Preconditions:

user is logged in and active. expense view list page is launched with at least 1 income

## Steps to Execute:

1. user clicks on `update income` action from income view `primary job`
2. after few seconds of waiting, user is redirected to income Edit form
3. verify all fields are initialized with appropriate values of income.
4. there are 2 buttons, `update` and `cancel`, are displayed at the bottom of screen.
5. user updates details below,
   - income name: change to `secondary job`
   - income amount: change to `2100`. verify `USA-USD` and `dollar symbol` is displayed to amount field.
   - income verified: click on verify indicator to change to verified.
   - income date: change to 1 month backword.
6. click on `cancel` button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~1) while income is being cancel.
- on successful, the expense list is showing with no changes to income details.
- `view receipts` action is still showing for the income.
- in small screen, it can be expanded. verify details

## Impact Area:

### frontend

- expense page
- update income form

### backend api

- expense list api
- income type api
- payment account api
- share person api
- income api get
- income tags api

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`expense,income,edit`
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
