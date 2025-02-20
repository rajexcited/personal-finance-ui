---
id: view-profile-tc1
title: View Profile Settings
execution: manual
created: 12/21/2024
updated: 02/19/2025
---

# View Profile Settings

## Title:

View Profile Settings

## Description:

A logged-in user navigates to view the profile settings.

## Preconditions:

User is logged in. User is on the General Settings page.

## Steps to Execute:

1. User clicks on the `Profile` tab.
2. Verify the profile settings page is displayed with the following sections:
   - Personal Details
   - Currency Profiles
   - Preferences
3. Verify Personal Details section displays with following fields,
   - emailId / UserId
   - First Name
   - Last Name
   - `Change Name` button and it is clickable.
4. Verify Currency Profiles section displays with table of fields
   - Country
   - Currency
   <!-- 5. Verify Preferences section displays `Edit` button and it is clickable. -->

## Expected Outcome:

- The profile settings page is displayed with all sections.
- The fields and actions in each section are displayed correctly.

## Impact Area:

### Frontend

- General Settings page
- Profile page
- navigation component
- settings module
- profile component

### Backend API

- user details api

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
