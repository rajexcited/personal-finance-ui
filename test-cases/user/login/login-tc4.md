---
id: login-tc4
name: Login error incorrect format
about: user unable to login up because details are in incorrect format
labels: [test-scenario, login, impact-medium, negative]
---

# Login success

## Title:

User attempts to login with incorrect format

## Description:

public user tries to login with incorrect format, but login is disable

## Preconditions:

User has launched the public home page in chrome browser.

## Steps to Execute:

1. User navigates to login page
2. user fills out details as following,
   - emailId: `sardar.vallabhbhai.patel@example`
   - password: `sArdar`

## Expected Outcome:

- verify The login button is disable and error messages are showing to respective fields.

## Impact Area:

### frontend

- login page
- homepage

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`login`
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
