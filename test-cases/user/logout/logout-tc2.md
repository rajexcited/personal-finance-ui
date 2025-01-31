---
id: logout-tc2
---

# Logout abruptly

## Title:

User gets logout because site data is cleared

## Description:

logged in user has access to secured features. now user tries to clear sitedata. user gets logout because session gets invalidated.

## Preconditions:

User is logged in and is on any secured pages.

## Steps to Execute:

1. user clicks and confirm to clear sitedata.

## Expected Outcome:

- verify The session get invalidated immediately. Hence, user is logged out.
- verify logout api is not called.
- verify user is shown the success logout message.
- verify public navigation links displayed and user can't access secured pages or features.

## Impact Area:

### frontend

- logout page
- homepage

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`logout`
- execution=`manual`
- impact=`medium`
- type=`positive`

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
