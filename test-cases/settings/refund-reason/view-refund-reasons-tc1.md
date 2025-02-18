---
id: view-refund-reasons-tc1
title: View Refund Reasons
execution: manual
created: 12/21/2024
updated: 02/15/2025
---

# View Refund Reasons

## Title:

View Refund Reasons

## Description:

A logged-in user navigates to view the refund reasons In desktop browser large screen.

## Preconditions:

User is logged in. User is on the homepage.

## Steps to Execute:

1. User clicks on the `Settings` navigation link.
2. After a few seconds of waiting, the general settings page is displayed.
3. User clicks on the `Refund Reason` tab.
4. Verify the refund reasons page is displayed with a list of enabled refund reasons.
5. Verify toggler `Filtered by enabled` is ON.
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
9. Verify list of enabled and disabled refund reasons are displayed.
10. Verify each row in list displays, verify fields and actions as per expected:
    - name and status(enable/disable)
    - description
    - view button
    - hoverable ellipsis with actions,
      - edit
      - delete
      - change to Disable/Enable

## Expected Outcome:

- The refund reasons page is displayed with a list of enabled refund reasons.
- The `Add` button is displayed.
- The refund reasons are displayed correctly with `Edit`, `Delete`, and `Change to Disable` actions.

## Impact Area:

### Frontend

- General Settings page
- View Refund Reason page
- navigation component
- settings module
- refund reason component

### Backend API

- refund reason api

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

- /api/settings/refund-reasons/get=1.44 sec

### Lambda:

#### get refund reasons

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
