---
id: login-tc1
---

# Login success

## Title:

User attempts to login successfully

## Description:

public user tries to login successful. upon login, user can access all secured features e.g. add purchase, view settings, etc.

## Preconditions:

User has launched the public home page in chrome browser.

## Steps to Execute:

1. User navigates to login page
2. user fills out details as following,
   - emailId: `sardar.vallabhbhai.patel@example.com`
   - password: `$Ardar123`
3. user clicks on login button

## Expected Outcome:

- The loading indicator is displayed for few seconds (~5).
  -verify user is navigated to `secured homepage`.
- verify secured links like, expenses, payment accounts, settings, logout, etc. are showing and navigational.

## Impact Area:

### frontend

- login page
- homepage

### backend api

- login api
- stats api
- userdetails api

## Type of Test:

- Integration
- Regression
- Demo site testable

## Tags:

- feature=`login`
- execution=`manual`
- impact=`high`
- type=`positive`
- enablement=`regression`

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
