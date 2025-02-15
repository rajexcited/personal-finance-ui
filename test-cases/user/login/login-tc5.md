---
id: login-tc5
title: User login after logout
execution: manual
created: 12/21/2024
updated: 02/14/2025
---

# Login success after logout

## Title:

User login successful after logout

## Description:

Logged in user logs out successfully. After logging out, user tries to login again immediately. When successful, user can access all secured features e.g. add purchase, view settings, etc.

## Preconditions:

User is logged in with following values. User is on secured home page.

- emailId: `sardar.vallabhbhai.patel@example.com`
- password: `$Ardar123`

## Steps to Execute:

1. Verify logout navigation link is displayed
2. User clicks on logout link.
3. Verify user is redirected to logout page and is shown the success message.
4. Verify public navigation links are displayed.
5. Verify user can't access secured pages or features.
6. User clicks on login navigation link without any wait.
7. Verify login page is loaded with necessary input fields
   - emailId
   - password
8. Verify Signup and login buttons are displayed
9. User fills out with same credential details
10. User clicks on login button

## Expected Outcome:

- The loading indicator is displayed for a few seconds (~5). Verify user is navigated to `secured homepage`.
- Verify secured links like, expenses, payment accounts, settings, logout, etc. are showing and navigational.

## Impact Area:

### frontend

- Login page
- Logout page
- Home Public page
- Home Secured page
- auth module
- public module
- navigation component
- authen component

### backend api

- user logout api
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

- feature=`auth,login,logout`
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

- api/user/login/post=1.8 sec
- api/user/details/get=2.3 sec
- api/stats/purchase/get=1.44 sec
- api/stats/refund/get=1.24 sec
- api/stats/income/get=768 ms
- api/user/logout/post=1.8 sec

### Lambda:

#### user logout

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

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
