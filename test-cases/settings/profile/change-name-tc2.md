---
id: change-name-tc2
title: Change Name in Profile Settings
execution: manual
created: 12/21/2024
updated: 02/19/2025
---

# Change Name in Profile Settings

## Title:

Change Name in Profile Settings

## Description:

A logged-in active user changes their name in the profile settings.

## Preconditions:

User is logged in and active. User is on the Profile page.

## Steps to Execute:

1. Verify Personal Details section displays with following fields,
   - emailId / UserId
   - First Name
   - Last Name
   - `Change Name` button and it is clickable.
2. User clicks on the `Change Name` button
3. Verify form is displayed to change the name.
4. Verify Update and Cancel buttons are displayed next to name input fields.
5. User enters a new first name and last name.
6. User clicks on `Cancel` button, input form fields are not displayed and first and last name unchanged.
7. repeat steps 2 to 4.
8. User clicks on the `Save` button.
9. Verify the first and last name is updated in the Personal Details section.

## Expected Outcome:

- The name change form is displayed correctly.
- The name is updated in the Personal Details section after saving.

## Impact Area:

### Frontend

- Profile page

### Backend API

- user details update api

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`settings,profile`
- execution=`manual`
- impact=`low`
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

#### Network calls:

### Lambda:

## Notes/Comments:

Any additional information or considerations.
