---
id: change-pwd-tc2
title: Change Password
execution: manual
created: 12/21/2024
updated: 02/19/2025
---

# Change Password

## Title:

Change Password

## Description:

A logged-in active user navigates to security settings and changes the password.

## Preconditions:

User is logged in and active. User is on the security settings page.

## Steps to Execute:

1. User clicks on the `Change Password` button in the Password settings section.
2. Verify the change password modal is displayed with the following fields:
   - Current password
   - New password
   - Confirm new password
3. Verify Cancel and Save buttons are displayed in modal footer
4. User enters the current password, new password, and confirms the new password.
5. User clicks on the `Cancel` button.
6. Verify change password modal is hidden and change password api is not called.
7. repeat step 1 to 4.
8. User clicks on the `Save` button.
9. Verify the password is successfully changed and a confirmation message is displayed.

## Expected Outcome:

- The change password modal is displayed with the correct fields.
- The password is successfully changed and a confirmation message is displayed.

## Impact Area:

### Frontend

- Security page
- Change Password modal
- navigation component
- settings module
- security component

### Backend API

- change password api

## Type of Test:

- End to End
- Demo site testable

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

- /api/settings/security/change-password=1.44 sec

### Lambda:

#### change password

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
