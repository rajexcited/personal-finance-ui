---
id: add-refund-reason-tc2
title: Add Refund Reason
execution: manual
created: 12/21/2024
updated: 02/15/2025
---

# Add Refund Reason

## Title:

Add Refund Reason

## Description:

A logged-in and active user can add a new refund reason

## Preconditions:

User is logged in and active. User is on the `view refund reason` page.

## Steps to Execute:

1. User clicks on the `Add` button.
2. Verify the `Add Refund Reason` form is displayed with necessary input fields:
   - **Name:** empty
   - **Status:** toggle switch (enabled by default)
   - **Color:** color picker with default color
   - **Description:** empty and counter is 0/400
   - **Tags:** empty and counter is 0/10
3. Verify 2 buttons, `save` and `cancel`, are displayed.
4. User fills in the form fields:
   - **Name:** Product Return
   - **Color:** red
   - **Description:** `Defective product return` and counter is 24/400
   - **Tags:** `refund, return` and counter is 2/10
5. User clicks on the `Save` button.
6. Verify the new refund reason is added to the list with the correct details.
7. User navigated `add refund` page
8. Verify `Product Return` exists in `refund reason` dropdown

## Expected Outcome:

- The `Add Refund Reason` form is displayed.
- The new refund reason is added to the list with the correct details and can be seen in enabled list.

## Impact Area:

### Frontend

- View Refund Reason page
- Add Refund Reason page
- Add Refund page
- Edit Refund page
- settings module
- refund reason component
- refund component

### Backend API

- refund reason api
- refund reason tags api

## Type of Test:

- End to End
- Demo site testable

## Tags:

- feature=`settings,refund,expense`
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

- /api/settings/refund-reasons/add=1.44 sec

### Lambda:

#### add refund reason

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
