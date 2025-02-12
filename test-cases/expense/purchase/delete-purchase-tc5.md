---
id: delete-purchase-tc5
title: Delete Purchase successful
execution: manual
created: 12/21/2024
updated: 02/12/2025
---

# Delete Purchase - Success

## Title:

Delete purchase successfully

## Description:

Logged in active user can delete existing purchase details

## Preconditions:

User is logged in and active. User is `view expenses` page and there is at least 1 purchase listed.

## Steps to Execute:

1. Verify purchase row has `delete purchase` action enabled.
2. User clicks on `delete purchase` action link.
3. System pops up dialog to confirm the action. `Do you really want to delete expense purchase?`
4. User choose to `no` the action. verify if expense is selected.
5. User clicks on `delete purchase` action link again.
6. On confirm popup, user selects to `yes` to confirm.
7. After few seconds of waiting, the purchase is deleted and purchase is removed from view list.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while purchase is being deleted.

## Impact Area:

### frontend

- View Expenses page
- expenses module
- purchase component

### backend api

- expense count api
- expense api
- purchase api
- purchase type api
- income api
- income type api
- refund api
- refund reason api
- payment account api

## Type of Test:

- End to End
- Demo site testable

## Tags:

- feature=`expense`
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

#### delete purchase

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
