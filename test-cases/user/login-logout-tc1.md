---
id: login-logout-tc1
---

# Login success

## Title:

User login successful after logout

## Description:

logged in user tries to logout successful. upon logging out, user tries to login again. when successful user can access all secured features e.g. add purchase, view settings, etc.

## Preconditions:

User is on login page.

## Steps to Execute:

1. user fills out details as following,
   - emailId: `sardar.vallabhbhai.patel@example.com`
   - password: `$Ardar123`
2. user clicks on login button
3. login is successful, and logout link is displayed.
4. user clicks on logout link
5. user logs out successfully.
6. user attempts login with same credential immediately

## Expected Outcome:

- The loading indicator is displayed for few seconds (~5).
- verify user is navigated to `secured homepage`.
- verify secured links like, expenses, payment accounts, settings, logout, etc. are showing and navigational.

## Impact Area:

### frontend

- login page
- homepage
- logout page

### backend api

- login api
- stats api
- userdetails api
- logout api

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`login,logout`
- execution=`manual`
- impact=`low`
- type=`positive`

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

#### user-login

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
