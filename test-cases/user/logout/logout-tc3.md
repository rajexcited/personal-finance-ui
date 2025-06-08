---
id: logout-tc3
title: logout when session gets timeout
execution: manual
created: 12/21/2024
updated: 02/14/2025
---

# Logout when session gets timeout

## Title:

User logout when session gets timeout

## Description:

Logged in user is automatically logged out when the session gets timeout after 30 min. User is redirected to the login page with a session expired message.

## Preconditions:

User is logged in and is on any secured pages e.g. secured home page.

## Steps to Execute:

1. Wait for the session timeout duration. 30 minutes after login.
2. Observe the application behavior after the session timeout.

## Expected Outcome:

- Verify User is automatically logged out of the application.
- Verify User is redirected to the login page.
- Verify message is displayed indicating that the session has expired.
- Verify user can't access secured pages or features.

## Impact Area:

### frontend

- Login page
- Home Public page
- auth module
- authen component

### backend api

- user logout api

## Type of Test:

- End to End
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

- index.html=450 ms
- api/user/logout/timeout=1.8 sec

### Lambda:

#### user logout

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
