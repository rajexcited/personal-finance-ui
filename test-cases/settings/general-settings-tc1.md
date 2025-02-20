---
id: general-settings-tc1
title: General Settings Page Load
execution: manual
created: 12/21/2024
updated: 02/15/2025
---

# General Settings Page Load

## Title:

General Settings Page Load

## Description:

A logged-in user navigates to the settings, and the general settings page is loaded with the default theme and other settings tabs.

## Preconditions:

User is logged in. User is on the homepage.

## Steps to Execute:

1. User clicks on the `Settings` navigation link.
2. After a few seconds of waiting, the general settings page is displayed.
3. Verify the following tabs are displayed:
   - General
   - Purchase Type
   - Income Type
   - Refund Reason
   - Payment Account Type
   - Share Person
   - Security
   - Profile
4. Verify theme with selected value is displayed.
5. Verify user cannot change theme selections.
6. In small / mobile screen, verify tabs are displayed as navigation sub links to settings

## Expected Outcome:

- The general settings page is displayed with the default theme.
- The tabs with title and links are displayed. tabs are clickable.

## Impact Area:

### Frontend

- General Settings page
- navigation component
- settings module
- theme component

### Backend API

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`settings`
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

#### Network calls:

- /api/settings/get=1.44 sec

### Lambda:

#### get settings

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
