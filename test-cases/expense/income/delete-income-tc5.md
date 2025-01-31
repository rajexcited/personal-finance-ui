---
id: delete-income-tc5
---

# Delete Income - Success

## Title:

Delete income successfully

## Description:

active user can delete existing income details

## Preconditions:

user is logged in and active. expense view list page is launched with at least 1 income

## Steps to Execute:

1. the income has `delete income` action enabled.
2. user clicks on `delete income` action link.
3. system pops up dialog to confirm the action. `Do you really want to delete expense income?`
4. user choose to `no` the action. verify if expense is selected.
5. user clicks on `delete income` action link again.
6. on confirm popup, user selects to `yes` to confirm.
7. after few seconds of waiting, the income is deleted and income is removed from view list.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while income is being deleted.

## Impact Area:

### frontend

- expense page
- delete income

### backend api

- expense list api
- income type api
- payment account api
- share person api
- income api delete

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`expense,income,delete`
- execution=`manual`
- impact=`low`
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
