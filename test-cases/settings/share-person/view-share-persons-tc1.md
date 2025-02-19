---
id: view-share-persons-tc1
title: View Share Persons
execution: manual
created: 12/21/2024
updated: 02/18/2025
---

# View Share Persons

## Title:

View Share Persons

## Description:

A logged-in user navigates to view the share persons In desktop browser large screen.

## Preconditions:

User is logged in. User is on the homepage.

## Steps to Execute:

1. User clicks on the `Settings` navigation link.
2. After a few seconds of waiting, the general settings page is displayed.
3. User clicks on the `Share Person` tab.
4. When there are no share persons, verify message `There are no Share Persons configured.` is displayed
5. When there is at least 1 share person exists, verify list of enabled share persons displayed. and verify toggler `Filtered by enabled` is ON.
6. Verify the `Add` button is displayed
7. Verify each row in list displays, verify fields and actions as per expected:
   - name and status(enable)
   - description
   - view button
   - hoverable ellipsis with actions,
     - edit
     - delete
     - change to Disable
8. User clicks on toggler `Filtered by enabled` to OFF. Verify toggler title changed to `All Types`.
9. Verify list of enabled and disabled share persons are displayed.
10. Verify each row in list displays, verify fields and actions as per expected:
    - name and status(enable/disable)
    - description
    - view button
    - hoverable ellipsis with actions,
      - edit
      - delete
      - change to Disable/Enable

## Expected Outcome:

- The share persons page is displayed with a list of enabled share persons.
- The `Add` button is displayed.
- The share persons are displayed correctly with `Edit`, `Delete`, and `Change to Disable` actions.

## Impact Area:

### Frontend

- General Settings page
- View Share Person page
- navigation component
- settings module
- share person component

### Backend API

- share person api

## Type of Test:

- Integration
- Regression
- Demo site testable

## Tags:

- feature=`settings`
- execution=`manual`
- impact=`medium`
- type=`positive`
- devices=`desktop`

## Affected Versions:

v0.1.0

## Attachments:

Screenshots

## Average Performance Time:

### Test:

total=1 min

### Browser:

#### Network calls:

- /api/settings/share-persons/get=1.44 sec

### Lambda:

#### get share persons

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
