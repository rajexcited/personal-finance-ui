---
id: delete-account-tc3
title: Delete account
execution: manual
created: 12/21/2024
updated: 02/19/2025
---

# Delete Account

## Title:

Delete Account

## Description:

A logged-in active user navigates to security settings and request to delete account.

## Preconditions:

User is logged in and active. User is on the security settings page.

## Steps to Execute:

1. User clicks on the `Delete Account` button in the account settings section.
2. Verify the delete account modal is displayed with the following fields:
   - Email Id
   - Current password
   - Warning Message
3. Verify Cancel and De-activate buttons are displayed in modal footer
4. User enters the emailId and password.
5. User clicks on the `Cancel` button.
6. Verify delete account modal is hidden and delete account api is not called.
7. repeat step 1, 2 & 3.
8. User clicks on the `De-activate` button.
9. Verify the account is successfully de-activated and a confirmation message is displayed.
10. Verify user account is read-only.
11. User cannot change password, un-delete account, add or edit any data.
12. Verify User can still view all expenses, payment accounts and settings.

## Expected Outcome:

- The delete account modal is displayed with the correct fields.
- The user account is successfully de-activated and a confirmation message is displayed.
- The user account becomes read-only account. User cannot add / edit anything. User can still navigate to all view pages.

## Impact Area:

### Frontend

- Security page
- Delete account modal
- navigation component
- settings module
- security component

### Backend API

- delete account api

## Type of Test:

- End to End

## Tags:

- feature=`settings,security`
- execution=`manual`
- impact=`medium`
- type=`positive`
- devices=`desktop`

## Affected Versions:

v0.1.0

## Attachments:

Screenshots

## Average Performance Time:

### Test:

total=1 min

### Browser:

#### Network calls:

- /api/settings/security/delete-account=1.44 sec

### Lambda:

#### delete account

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
