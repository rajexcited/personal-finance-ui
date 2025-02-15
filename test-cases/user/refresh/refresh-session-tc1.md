---
id: refresh-session-tc1
title: Session refresh successful
execution: manual
created: 02/14/2025
updated: 02/14/2025
---

# Session Refresh Success

## Title:

Session refresh successful

## Description:

Verify that the user session is refreshed successfully and the user remains logged in without any interruption.

## Preconditions:

User is logged in and has an active session.

## Steps to Execute:

1. Wait for the session to be close to expiration. wait for 27 min
2. Verify the session refresh mechanism is triggered automatically.
3. User clicks on refresh session and confirm.
4. Verify the session expiration time is extended. and refresh message is not diplayed
5. Verify the user remains on the current page without any interruption.
6. Verify User can navigate to all secured pages from header navigation bar
   - expenses
   - payment accounts
   - general settings
   - payment account type
   - purchase type
   - income type
   - refund reason
   - share person
   - profile
   - security

## Expected Outcome:

- The session refresh mechanism is triggered automatically.
- The user remains on the current page without any interruption.
- The session expiration time is extended successfully.

## Impact Area:

### frontend

- auth module
- navigation component
- authen component

### backend api

- user refresh session api

## Type of Test:

- End to End
- Demo site testable

## Tags:

- feature=`auth`
- execution=`manual`
- impact=`medium`
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

- api/user/refresh/post=1.2 sec

### Lambda:

#### user refresh session

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
