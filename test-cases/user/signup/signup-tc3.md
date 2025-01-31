---
id: signup-tc3
---

# Signup error when incorrect format

## Title:

User attempts to sign up but details are in incorrect format

## Description:

public user tries to sign up with incorrect format, so signup is disable

## Preconditions:

User has navigated to the signup page in chrome browser.

## Steps to Execute:

1. user fills out following incorrect details,
   - first name: `sardar >vallabhbhai`
   - last name: `patel^`
   - emailId: `sardar.vallabhbhai.patelexample.com`
   - password: `sArdar`
   - re-password: `sArdar`
   - country: `USA`

## Expected Outcome:

The signup button is disable and error messages are showing to respective fields.

## Impact Area:

### frontend

- signup page

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

### Lambda:

## Notes/Comments:

Any additional information or considerations.
