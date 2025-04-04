---
id: add-income-tc1
title: Add Income successful
execution: manual
created: 12/21/2024
updated: 02/11/2025
---

# Add Income - Success

## Title:

Add income successful

## Description:

Logged in active user can add income successfully

## Preconditions:

User is logged in and active. User is on `view expenses` page.

## Steps to Execute:

1. Verify `add income` button is displayed
2. User clicks on `add income` button
3. After few seconds of waiting, user is redirected to income add form
4. Verify add income page is displayed with necessary input fields:
   - **income name:** empty
   - **amount symbol:** default initialized to `USA-USD`
   - **income amount:** empty
   - **payment account:** dropdown select is displayed with error `please select an item from dropdown`. verify atleast item `cash` exists.
   - **income type:** dropdown `select` is displayed with error `please select an item from dropdown`. there are list of default values displayed. Verify the list matches with all enabled income types.
   - **tag person:** empty and counter is 0/10.
   - **tags:** empty and counter is 0/10.
   - **description:** empty and counter is 0/150
   - **income verified:** verified the indicator is `income un-verified`.
   - **income date:** today is selected
   - **upload receipt:** verify message `no receipt uploaded` is displayed. when clicking on `upload receipt` button, a popup opens having button and message `there are no receipts`.
5. Verify 2 buttons, `add` and `cancel`, are displayed at the bottom of screen.
6. User fills out below details,
   - **income name:** `primary job`
   - **income amount:** `1440`
   - **payment account:** choose `cash`
   - **income type:** choose `salary`.
   - **tag person:** if there is any available to choose one person, otherwise leave empty.
   - **tags:** enter and select `job`
   - **description:** fill out `I received salary for my primary job`
   - **income verified:** do not change. leave this default value.
   - **income date:** select previous month.
   - **upload receipt:**
     - click on button and choose an pdf e.g. paycheck.
     - now the embedded pdf is viewable with name.
     - upon clicking on `view` button it opens in fullscreen.
     - close the popup
7. User clicks on `add` button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while income is being added.
- When successfully added, the expense list is showing new added income with filled out values.
- `view receipts` action exist for the income.
- In small/mobile screen, it can be expanded, verify details

## Impact Area:

### frontend

- View Expenses page
- Add Income page
- navigation component
- expenses module
- income component
- upload receipts

### backend api

- expense count api
- expense api
- income api
- income type api
- payment account api
- share person api
- income tags api
- currency profile api
- income receipt api

## Type of Test:

- End to End
- Regression
- Demo site testable

## Tags:

- feature=`expense,income`
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

- /api/config/types/belongs-to/income-type?status=enable/get=2.01 sec
- /api/config/types/belongs-to/income-type/tags/get=1.84 sec
- /api/expenses/income/tags?year=2025&year=2024/get=1.9 sec
- /api/config/types/belongs-to/share-person?status=enable/get=? sec
- /api/expenses/income/id/<income-id>/receipts/id/<receipt-id>/post=966 ms
- /api/expenses/income/post=2.75 sec
- /api/expenses/count?pageNo=1&status=enable&pageMonths=6/get=1.9 sec

### Lambda:

#### get income type list (status=enable)

- invocation in 15 min=1
- memory size=128 MB
- memory used=106 MB
- bill duration=1010 ms
- init duration=652 ms

#### get income type tag list

- invocation in 15 min=1
- memory size=128 MB
- memory used=103 MB
- bill duration=763 ms
- init duration=709 ms

#### get income tag list (year= 2024 & 2025)

- invocation in 15 min=1
- memory size=128 MB
- memory used=103 MB
- bill duration=878 ms
- init duration=657 ms

#### add income

- invocation in 15 min=1
- memory size=128 MB
- memory used=104 MB
- bill duration=1756 ms
- init duration=666 ms

#### get expense count (pageNo=1, status=enable, pageMonths=6)

- invocation in 15 min=2
- memory size=128 MB
- memory used=103 MB
- bill duration=877 ms
- init duration=654 ms

## Notes/Comments:

Any additional information or considerations.
