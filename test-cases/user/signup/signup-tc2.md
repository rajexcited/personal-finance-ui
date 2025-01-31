---
id: signup-tc2
---

# Signup fail duplicate email

## Title:

User attempts to sign up again with same emailId

## Description:

user already has an account with emailId. public user tries to sign up with same emailId and gets failure.

## Preconditions:

User has launched the public home page in chrome browser.

## Steps to Execute:

1. User navigates to signup page
2. user fills out same details as following,
   - first name: `sardar vallabhbhai`
   - last name: `patel`
   - emailId: `sardar.vallabhbhai.patel@example.com`
   - password: `$Ardar123`
   - re-password: `$Ardar123`
   - country: `USA`
3. user clicks on signup button

## Expected Outcome:

- The loading indicator is displayed for few seconds (~4).
- verify user is shown an error message `already exists`.

## Impact Area:

### frontend

- signup page
- homepage

### backend api

- signup api

## Type of Test:

- Integration
- Feature
- Demo site testable

## Tags:

- feature=`signup`
- execution=`manual`
- impact=`medium`
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
