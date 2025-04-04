---
id: logout-tc1
title: logout successful by user
execution: manual
created: 12/21/2024
updated: 02/14/2025
---

# Logout success by user

## Title:

User logout successful by request

## Description:

Logged in user tries to logout successfully. When successful, user is shown a success message and only public links are shown.

## Preconditions:

User is logged in and is on any secured pages e.g. secured home page.

## Steps to Execute:

1. Verify logout link in navigation is displayed.
2. User clicks on logout link.

## Expected Outcome:

- The loading indicator is displayed for a few seconds (~2).
- Verify user is redirected to logout page and is shown the success message.
- Verify public navigation links are displayed.
- Verify user can't access secured pages or features.

## Impact Area:

### frontend

- Logout page
- Home Public page
- auth module
- authen component

### backend api

- user logout api

## Type of Test:

- End to End
- Regression
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

- api/user/logout/post=3.3 sec

### Lambda:

#### user logout

- invocation in 15 min=1
- memory size=256 MB
- memory used=101 MB
- bill duration=460 ms
- init duration=627 ms

## Notes/Comments:

Any additional information or considerations.
