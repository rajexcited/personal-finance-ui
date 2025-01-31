---
id: login-tc2
---

# Login fails

## Title:

User attempts to login and gets access denied error

## Description:

public user tries to login and fails because of incorrect credentials.

## Preconditions:

User has launched the public home page in chrome browser.

## Steps to Execute:

1. User navigates to login page
2. user fills out details as following,
   - emailId: `sardar.vallabhbhai.patel@example.com`
   - password: `$Ardar1234`
3. user clicks on login button

## Expected Outcome:

- The loading indicator is displayed for few seconds (~5).
- verify the error message `unauthorize user` is shown.
- verify there is no change in session or navigation links.

## Impact Area:

### frontend

- login page
- homepage

### backend api

- login api

## Type of Test:

- Integration
- Regression
- Demo site testable

## Tags:

- feature=`login`
- execution=`manual`
- impact=`high`
- type=`negative`

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
