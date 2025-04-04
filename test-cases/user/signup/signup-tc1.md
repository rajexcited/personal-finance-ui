---
id: signup-tc1
title: User signup successful
execution: manual
created: 12/21/2024
updated: 02/14/2025
---

# Signup success

## Title:

User signup successful

## Description:

Public user signs up successfully for the first time and can access all secured features e.g. add purchase, view settings, etc.

## Preconditions:

User is not logged in and is on the public home page. User does not have an existing account.

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
   - first name: `Steven`
   - last name: `Jobs`
   - emailId: `steven.jobs@example.com`
   - password: `st<Ven987`
   - re-password: `st<Ven987`
   - country: `USA`
5. User clicks on signup button

## Expected Outcome:

- The loading indicator is displayed for a few seconds (~10). Verify user is navigated to `secured homepage`.
- Verify secured links like, expenses, payment accounts, settings, logout, etc. are showing and navigational.

## Impact Area:

### frontend

- Signup page
- Home Public page
- Home Secured page
- auth module
- public module
- navigation component
- authen component

### backend api

- user signup api
- user details api
- income stats api
- purchase stats api
- refund stats api

## Type of Test:

- End to End
- Regression
- Demo site testable

## Tags:

- feature=`auth,signup`
- execution=`manual`
- impact=`medium`
- type=`positive`
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

- api/user/signup/post=2.93 sec

### Lambda:

#### user signup

- invocation in 15 min=1
- memory size=256 MB
- memory used=107 MB
- bill duration=1895 ms
- init duration=679 ms

## Notes/Comments:

Any additional information or considerations.
