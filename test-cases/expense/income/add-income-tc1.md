---
id: add-income-tc1
---

# Add Income - Success

## Title:

Add income successfully

## Description:

logged in active user can submit new income

## Preconditions:

user is logged in and active. expense view list page is launched

## Steps to Execute:

1. user clicks on `add income` button
2. after few seconds of waiting, user is redirected to income add form
3. verify all fields are empty or default initialized.
4. there are 2 buttons, `add` and `cancel`, are displayed at the bottom of screen.
5. user fills out below details,
   - income name: `primary job`
   - income amount: `1440`. verify `USA-USD` and `dollar symbol` is displayed to amount field.
   - payment account: dropdown select is displayed with error `please select an item from dropdown`. verify atleast item `cash` exists. choose `cash`
   - income type: dropdown select is displayed with error `please select an item from dropdown`. there are list of default values displayed. choose `salary`.
   - tag person: verify this is empty and counter is 0. if there is any available to choose one person, otherwise leave empty.
   - description: fill out `I received salary for my primary job`
   - tags: verify this is empty and counter is 0. enter and select `job`
   - income verified: verified the indicator is `income un-verified`. leave this default value.
   - income date: verify the date is today. select previous month.
   - upload receipt: verify message `no receipt uploaded` is displayed.
     - when click on `upload receipt` button, a popup opens having button and message `there are no receipts`.
     - click on button and choose an pdf e.g. paycheck. now the embedded pdf is viewable with name. upon clicking on `view` button it opens in fullscreen.
     - close the popup
6. click on `add` button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while income is being added.
- when successfully added, the expense list is showing new added income with filled out values.
- `view receipts` action exist for the income.
- in small screen, it can be expanded, verify details

## Impact Area:

### frontend

- expense page
- add income form

### backend api

- expense list api
- income type api
- payment account api
- share person api
- income tags api
- income api post

## Type of Test:

- Integration
- Regression
- Demo site testable

## Tags:

- feature=`expense,income,add`
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
