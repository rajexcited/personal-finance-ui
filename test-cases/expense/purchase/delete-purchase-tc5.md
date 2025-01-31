---
id: delete-purchase-tc5
---

# Delete Purchase - Success

## Title:

Delete purchase successfully

## Description:

active user can delete existing purchase details

## Preconditions:

user is logged in and active. expense view list page is launched with at least 1 purchase

## Steps to Execute:

1. the purchase has `delete purchase` action enabled.
2. user clicks on `delete purchase` action link.
3. system pops up dialog to confirm the action. `Do you really want to delete expense purchase?`
4. user choose to `no` the action. verify if expense is selected.
5. user clicks on `delete purchase` action link again.
6. on confirm popup, user selects to `yes` to confirm.
7. after few seconds of waiting, the purchase is deleted and purchase is removed from view list.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while purchase is being deleted.

## Impact Area:

### frontend

- expense page
- delete purchase

### backend api

- expense list api
- purchase type api
- payment account api
- share person api
- purchase api delete

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`expense,purchase,delete`
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
