---
id: signup-tc3
title: Signup Form - UI validations
execution: manual
created: 12/21/2024
updated: 02/14/2025
---

# Signup form UI validations

## Title:

Signup form UI validations

## Description:

Perform signup form UI field validations

## Preconditions:

User is not logged in and is on the public home page.

## Steps to Execute:

1. Verify navigation has signup link
2. User clicks on signup navigation link
3. Verify signup page is loaded with necessary input fields
   - first name
   - last name
   - emailid
   - password
   - re-password
   - country
4. Verify Signup and login buttons are displayed
5. User fills out details as following,
   - first name: `sardar >vallabhbhai`
   - last name: `patel^`
   - emailId: `sardar.vallabhbhai.patelexample.com`
   - password: `sArdar`
   - re-password: `sArdar`
   - country: `USA`

## Expected Outcome:

- Verify error messages are shown to respective fields
- Verify the signup button is disabled

## Impact Area:

### frontend

- Signup page
- Home Public page
- auth module
- public module
- authen component

### backend api

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`auth,signup`
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
