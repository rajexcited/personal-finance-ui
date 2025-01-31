---
id: logout-tc1
---

# Logout success

## Title:

logged in user (active or deactivated) attempts to logout successful

## Description:

secure user tries to logout successful. when successful, user is shown success message. and only public links shown.

## Preconditions:

User is logged in and is on any secured pages.

## Steps to Execute:

1. logout link in navigation bar is displayed.
2. user clicks on logout link

## Expected Outcome:

- The loading indicator is displayed for few seconds (~2).
- verify user is shown the success logout message.
- verify public navigation links displayed.
- verify user can't access secured pages or features.

## Impact Area:

### frontend

- logout page
- homepage

### backend api

- logout api

## Type of Test:

- Integration
- Regression
- Demo site testable

## Tags:

- feature=`logout`
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
