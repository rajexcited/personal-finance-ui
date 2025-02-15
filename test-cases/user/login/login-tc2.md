---
id: login-tc2
title: User login gets access denied
execution: manual
created: 12/21/2024
updated: 02/13/2025
---

# Login fails

## Title:

User attempts to login and gets access denied error

## Description:

Public user tries to login and fails because of incorrect credentials.

## Preconditions:

User is not logged in and is on public home page.

## Steps to Execute:

1. User clicks on login navigation link
2. Verify login page is loaded with emailId and password input fields
3. Verify Signup and login buttons are displayed
4. User fills out details as following,
   - emailId: `sardar.vallabhbhai.patel@example.com`
   - password: `$Ardar1234`
5. user clicks on login button

## Expected Outcome:

- The loading indicator is displayed for few seconds (~5).
- Verify the error message `unauthorize user` is shown.
- Verify there is no change in session or navigation links.

## Impact Area:

### frontend

- Home Public page
- Login page
- auth module
- public module

### backend api

- user login api

## Type of Test:

- End to End
- Regression
- Demo site testable

## Tags:

- feature=`auth,login`
- execution=`manual`
- impact=`high`
- type=`negative`
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

- index.html=450 ms
- api/user/login/post=1.8 sec

### Lambda:

#### user login

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
