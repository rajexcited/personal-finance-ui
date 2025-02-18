---
id: refund-reason-form-ui-validations-tc4
title: Refund Reason Form UI Validations
execution: manual
created: 12/21/2024
updated: 02/15/2025
---

# Refund Reason Form UI Validations

## Title:

Refund Reason Form UI Validations

## Description:

A logged-in and active user can validate the UI elements and constraints of the refund reason form.

## Preconditions:

User is logged in and active. User is on the `view refund reason` page.

## Steps to Execute:

1. User clicks on the `Add` button.
2. Verify the `Add Refund Reason` form is displayed with the following fields:
   - **Name:** input field with a placeholder `Enter refund reason name`
   - **Status:** toggle switch (enabled by default)
   - **Color:** color picker with default color
   - **Description:** empty with a counter showing `0/400`
   - **Tags:** empty with a counter showing `0/10`
3. Verify 2 buttons, `save` and `cancel`, are displayed.
4. User leaves the `Name` field empty and clicks on the `Save` button.
5. Verify an error message `Name is required` is displayed below the `Name` field.
6. User tries to enters a name exceeding the maximum length (15 characters), but unable to.
7. User enter a name with value `nm` and clicks on the `Save` button.
8. Verify an error message `Please lengthen this text to 3 characters or more (you are currently using 2 characters).` is displayed below the `Name` input field.
9. User clicks on the `Cancel` button.
10. Verify the refund reason is not added to the list.

## Expected Outcome:

- The `Add Refund Reason` form is displayed with all required fields.
- Appropriate error messages are displayed for invalid inputs.

## Impact Area:

### Frontend

- Add Refund Reason page
- Edit Refund Reason page
- settings module
- refund reason component

### Backend API

- refund reason tags api

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`settings`
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

#### Network calls:

- /api/settings/refund-reasons/tags/get=1.44 sec

### Lambda:

#### get refund reason tags

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
