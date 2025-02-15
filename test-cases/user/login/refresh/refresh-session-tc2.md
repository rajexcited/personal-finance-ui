---
id: refresh-session-tc2
title: Session not refreshed and user logs out
execution: manual
created: 02/14/2025
updated: 02/14/2025
---

# Session Not Refreshed and User Logs Out

## Title:

Session not refreshed and user logs out

## Description:

Verify that when the user does not refresh the session, the user is logged out successfully and redirected to the public home page.

## Preconditions:

User is logged in and has an active session.

## Steps to Execute:

1. Wait for the session to be close to expiration. wait for 27 min
2. Verify the session refresh mechanism is triggered automatically.
3. User does not click on refresh session.
4. Verify the user is redirected to the logout page after few minutes and shown the success message.
5. Verify public navigation links are displayed:
   - Home
   - Login
   - Signup
6. Verify user can't access secured pages or features.

## Expected Outcome:

- The session refresh mechanism is triggered automatically.
- The user is logged out successfully and redirected to the logout page.
- Public navigation links are displayed.
- The user can't access secured pages or features.

## Impact Area:

### frontend

- auth module
- navigation component
- authen component
- Logout page
- Home Public page

### backend api

- user logout api

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`auth,logout`
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

- api/user/logout/post=1.8 sec

### Lambda:

#### user logout

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
