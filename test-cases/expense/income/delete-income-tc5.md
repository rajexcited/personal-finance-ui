---
id: delete-income-tc5
title: Delete Income successful
execution: manual
created: 12/21/2024
updated: 02/11/2025
---

# Delete Income - Success

## Title:

Delete income successfully

## Description:

Logged in active user can delete existing income details

## Preconditions:

User is logged in and active. User is `view expenses` page and there is at least 1 income listed.

## Steps to Execute:

1. Verify income row has `delete income` action enabled.
2. User clicks on `delete income` action link.
3. System pops up dialog to confirm the action. `Do you really want to delete expense income?`
4. User choose to `no` the action. verify if expense is selected.
5. User clicks on `delete income` action link again.
6. On confirm popup, user selects to `yes` to confirm.
7. After few seconds of waiting, the income is deleted and income is removed from view list.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while income is being deleted.
- verify the income is removed from view list.

## Impact Area:

### frontend

- View Expenses page
- expenses module
- income component

### backend api

- expense count api
- expense api
- income api
- income type api
- purchase api
- purchase type api
- refund api
- refund reason api
- payment account api

## Type of Test:

- End to End
- Demo site testable

## Tags:

- feature=`expense,income`
- execution=`manual`
- impact=`low`
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

### Lambda:

#### delete income

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
