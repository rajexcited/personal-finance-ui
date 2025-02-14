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

1. User clicks on login navigation link
2. Verify login page is loaded with emailId and password input fields
3. Verify Signup and login buttons are displayed
4. User fills out details as following,
   - emailId: `sardar.vallabhbhai.patel@example.com`
   - password: `$Ardar123`
5. User clicks on login button

## Expected Outcome:

- The loading indicator is displayed for few seconds (~5). Verify user is navigated to `secured homepage`.
- Verify secured links like, expenses, payment accounts, settings, logout, etc. are showing and navigational.

## Impact Area:

### frontend

- Home Public page
- Home Secured page
- Login page
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

- feature=`auth`
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
- api/user/login/post=1.8 sec
- api/user/details/get=2.3 sec
- api/stats/purchase/get=1.44 sec
- api/stats/refund/get=1.24 sec
- api/stats/income/get=768 ms

### Lambda:

#### user login

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

#### user details

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

#### stats

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
