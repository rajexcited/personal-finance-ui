---
id: signup-tc2
title: User signup fails due to duplicate account
execution: manual
created: 12/21/2024
updated: 02/14/2025
---

# Signup fail duplicate account

## Title:

Failed sign up attempt due to duplicate account

## Description:

Public user tries to sign up with the emailId for which account already exists. The signup gets failure.

## Preconditions:

User is not logged in and is on the public home page. User has an existing account with the emailId.

## Steps to Execute:

1. User clicks on signup navigation link
2. Verify signup page is loaded with necessary input fields
   - first name
   - last name
   - emailid
   - password
   - re-password
   - country
3. Verify Signup and login buttons are displayed
4. User fills out details as following,
   - first name: `sardar vallabhbhai`
   - last name: `patel`
   - emailId: `sardar.vallabhbhai.patel@example.com`
   - password: `$Ardar456`
   - re-password: `$Ardar456`
   - country: `USA`
5. User clicks on signup button

## Expected Outcome:

- The loading indicator is displayed for a few seconds (~4).
- Verify user is shown an error message `already exists`.

## Impact Area:

### frontend

- Signup page
- Home Public page
- auth module
- public module

### backend api

- user signup api

## Type of Test:

- End to End
- Regression
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

#### network calls:

- index.html(reload)=1.2 sec
- api/user/signup/post=1.82 sec

### Lambda:

#### user signup

- invocation in 15 min=1
- memory size=256 MB
- memory used=103 MB
- bill duration=697 ms
- init duration=645 ms

## Notes/Comments:

Any additional information or considerations.
