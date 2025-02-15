---
id: login-tc4
title: login Form - UI validations
execution: manual
created: 12/21/2024
updated: 02/13/2025
---

# Login form UI validations

## Title:

Login form UI validations

## Description:

Perform login form UI field validations

## Preconditions:

User is not logged in and is on public home page.

## Steps to Execute:

1. Verify navigation has login link
2. User clicks on login link
3. Verify login page is loaded with emailId and password input fields
4. Verify Signup and login buttons are displayed
5. User fills out details as following,
   - emailId: `sardar.vallabhbhai.patel@example`
   - password: `sArdar`

## Expected Outcome:

- Verify error messages are showing to respective fields
- Verify The login button is disable

## Impact Area:

### frontend

- Home Public page
- Login page
- auth module
- public module
- authen component

### backend api

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`auth,login`
- execution=`manual`
- impact=`medium`
- type=`negative`
- devices=`desktop,mobile`

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
