---
id: login-tc1
title: User login successful
execution: manual
created: 12/21/2024
updated: 02/13/2025
---

# Login success

## Title:

User login successful

## Description:

Public user logins successfully in first attempt. and user can access all secured features e.g. add purchase, view settings, etc.

## Preconditions:

User is not logged in and is on public home page.

## Steps to Execute:

1. User clicks on login navigation link.
2. Verify login page is loaded with necessary input fields:
   - emailId
   - password
3. Verify Signup and login buttons are displayed.
4. User fills out details as follows:
   - emailId: `sardar.vallabhbhai.patel@example.com`
   - password: `$Ardar123`
5. User clicks on login button.

## Expected Outcome:

- The loading indicator is displayed for a few seconds (~5). Verify user is navigated to `secured homepage`.
- Verify secured links like, expenses, payment accounts, settings, logout, etc. are showing and navigational.

## Impact Area:

### frontend

- Login page
- Home Public page
- Home Secured page
- auth module
- public module
- navigation component
- authen component

### backend api

- user login api
- user details api
- income stats api
- purchase stats api
- refund stats api

## Type of Test:

- End to End
- Regression
- Demo site testable

## Tags:

- feature=`auth,login`
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

- index.html=1.8 sec
- api/user/login/post=2.10 sec
- api/user/details/get=3.31 sec
- api/stats/purchase/get=1.59 sec
- api/stats/refund/get=1.70 sec
- api/stats/income/get=1.60 ms

### Lambda:

#### user login

- invocation in 15 min=1
- memory size=512 MB
- memory used=104 MB
- bill duration=790 ms
- init duration=690 ms

#### token auth

- invocation in 15 min=1
- memory size=256 MB
- memory used=105 MB
- bill duration=620 ms
- init duration=655 ms

#### user details

- invocation in 15 min=1
- memory size=128 MB
- memory used=102 MB
- bill duration=725 ms
- init duration=685 ms

#### purchase stats

- invocation in 15 min=1
- memory size=256 MB
- memory used=112 MB
- bill duration=699 ms
- init duration=661 ms

#### income stats

- invocation in 15 min=1
- memory size=256 MB
- memory used=112 MB
- bill duration=645 ms
- init duration=685 ms

#### refund stats

- invocation in 15 min=1
- memory size=256 MB
- memory used=112 MB
- bill duration=628 ms
- init duration=677 ms

#### stats (avg)

- invocation in 15 min(purchase,income,refund)=3
- memory size=256 MB
- memory used=112 MB
- bill duration=658 ms
- init duration=675 ms

## Notes/Comments:

Any additional information or considerations.
