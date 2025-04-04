---
id: view-payment-accounts-tc1
title: View Payment Accounts
execution: manual
created: 02/14/2025
updated: 02/14/2025
---

# View Payment Accounts

## Title:

View payment accounts

## Description:

Logged in user can view the list of payment accounts and perform actions on each account if applicable. The cash payment account is special and cannot be deleted.

## Preconditions:

User is logged in and is on the homepage. There is at least one payment account listed.

## Steps to Execute:

1. User clicks on the payment accounts navigation link.
2. After a few seconds of waiting, the list of payment accounts is displayed.
3. Verify the `add payment account` button is displayed before the payment accounts list layout.
4. Verify fields and actions as per expected.
   - title
   - edit action
   - delete action
   - view / expand action
5. Verify the cash payment account is displayed and cannot be deleted.

## Expected Outcome:

- The loading indicator is displayed for a few seconds (~3) while payment accounts are loaded.
- Verify payment account card layout is displayed with correct actions.

## Impact Area:

### frontend

- View Payment Account page
- navigation component
- payment account module

### backend api

- payment account api
- payment account type api

## Type of Test:

- Integration
- Regression
- Demo site testable

## Tags:

- feature=`payment account`
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

- /api/payment/accounts?status=enable/get=1.89 sec
- /api/payment/accounts/tags=1.79 sec
- /api/config/types/belongs-to/pymt-account-type?status=enable&disable/get=2.04 sec
- /api/config/types/belongs-to/pymt-account-type/tags/get=1.69 sec

### Lambda:

#### get enabled payment accounts

- invocation in 15 min=1
- memory size=128 MB
- memory used=104 MB
- bill duration=880 ms
- init duration=679 ms

#### get payment account tags

- invocation in 15 min=1
- memory size=128 MB
- memory used=102 MB
- bill duration=788 ms
- init duration=680 ms

#### get enable & disabled payment account types

- invocation in 15 min=1
- memory size=128 MB
- memory used=106 MB
- bill duration=1137 ms
- init duration=672 ms

#### get payment account type tags

- invocation in 15 min=1
- memory size=128 MB
- memory used=102 MB
- bill duration=718 ms
- init duration=693 ms

## Notes/Comments:

Any additional information or considerations.
