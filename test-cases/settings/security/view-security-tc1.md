---
id: view-security-tc1
title: View Security Settings
execution: manual
created: 12/21/2024
updated: 02/19/2025
---

# View Security Settings

## Title:

View Security Settings

## Description:

A logged-in user navigates to view the security settings.

## Preconditions:

User is logged in. User is on the homepage.

## Steps to Execute:

1. User clicks on the `Settings` navigation link.
2. After a few seconds of waiting, the general settings page is displayed.
3. User clicks on the `Security` tab.
4. Verify the security settings page is displayed with the following sections:
   - Password settings
     <!-- - Two-factor authentication settings (TBD) -->
     <!-- - Security questions (TBD) -->
   - Account settings
5. Verify Password settings section displays `Change Password` button and it is clickable.
   <!-- - Two-factor authentication settings: enable/disable toggle, setup instructions -->
   <!-- - Security questions: list of questions, add new question button, edit/delete actions for each question -->
6. Verify Delete Account section displays `Delete account` button and it is clickable.

## Expected Outcome:

- The security settings page is displayed with all sections.
- The fields and actions in each section are displayed correctly.

## Impact Area:

### Frontend

- General Settings page
- Security page
- navigation component
- settings module
- security component

### Backend API

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`settings,security`
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
