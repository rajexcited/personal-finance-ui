---
id: login-tc3
title: User login override successful
execution: manual
created: 01/25/2025
updated: 02/13/2025
---

# Login duplicate session

## Title:

User attempts to login in different browser/tab/device

## Description:

User tried login again in different device and gets successful. so overridding previous existing session with current. and gets logout from previous session.

## Preconditions:

User has active session in chrome browser of desktop. In incognito chrome browser or mobile browser, User has launched site and is on login page.

## Steps to Execute:

1. Verify emailId and password input fields are displayed
2. Verify login and signup buttons are displayed
3. User fills out details as following,
   - emailId: `sardar.vallabhbhai.patel@example.com`
   - password: `$Ardar123`
4. User clicks on login button
5. User gets popup confirm dialog.
   - verify notification of duplicate session and existing active session info
   - verify 2 buttons, `cancel` and `Punch login`
6. User clicks on cancel button
7. Verify user is not loggedIn in current browser.
8. Verify previous existing session is still active.
9. Verify user can navigate to other secured pages in previous browser.
10. User attempts to login again in incognito or mobile browser by following steps 3,4,5.
11. User clicks `Punch login` button

## Expected Outcome:

- The loading indicator is displayed for few seconds (~5). Verify user is navigated to `secured homepage`.
- Verify secured links like, expenses, payment accounts, settings, logout, etc. are showing and navigational in current incognito/mobile browser.
- Verify the previous browser session gets inactive. User cannot take any secured action or navigate on previous browser. Verify public home page is redirected.

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
- Demo site testable

## Tags:

- feature=`auth,login`
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
