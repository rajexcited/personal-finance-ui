---
id: logout-tc2
title: User logout due to clearing browser site data
execution: manual
created: 01/25/2025
updated: 02/14/2025
---

# Logout abruptly

## Title:

User gets logged out because browser site data is cleared

## Description:

Logged in user has access to secured features. User tries to clear browser site data. User gets logged out because session gets invalidated.

## Preconditions:

User is logged in and is on any secured pages e.g. secured home page.

## Steps to Execute:

1. User clicks to clear browser site data and confirms the action.

## Expected Outcome:

- Verify the session gets invalidated immediately. Hence, user is logged out.
- Verify user is redirected to logout page and is shown the success message.
- Verify public navigation links are displayed
- Verify user can't access secured pages or features.

## Impact Area:

### frontend

- Logout page
- Home Public page
- auth module
- authen component

### backend api

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`auth,logout`
- execution=`manual`
- impact=`medium`
- type=`positive`
- devices=`desktop,mobile`

## Affected Versions:

v0.2.0

## Attachments:

Screenshots

## Average Performance Time:

### Test:

total=1 min

### Browser:

### Lambda:

## Notes/Comments:

Any additional information or considerations.
