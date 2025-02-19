---
id: add-purchase-type-tc2
title: Add Purchase Type
execution: manual
created: 12/21/2024
updated: 02/15/2025
---

# Add Purchase Type

## Title:

Add Purchase Type

## Description:

A logged-in and active user can add a new purchase type

## Preconditions:

User is logged in and active. User is on the `view purchase type` page.

## Steps to Execute:

1. User clicks on the `Add` button.
2. Verify the `Add Purchase Type` form is displayed with necessary input fields:
   - **Name:** empty
   - **Status:** toggle switch (enabled by default)
   - **Color:** color picker with default color
   - **Description:** empty and counter is 0/400
   - **Tags:** empty and counter is 0/10
3. Verify 2 buttons, `save` and `cancel`, are displayed.
4. User fills in the form fields:
   - **Name:** Office Supplies
   - **Color:** blue
   - **Description:** `Items used in the office` and counter is 18/400
   - **Tags:** `stationery, office` and counter is 2/10
5. User clicks on the `Save` button.
6. Verify the new purchase type is added to the list with the correct details.
7. Verify `View` button next to `Office Supplies` row is displayed
8. User clicks on `View` button for `Office Supplies`. verify details shown.
9. User navigated `add purchase` page
10. Verify `Office supplies` exists in `purchase type` dropdown

## Expected Outcome:

- The `Add Purchase Type` form is displayed.
- The new purchase type is added to the list with the correct details and can be seen in enabled list.

## Impact Area:

### Frontend

- View Purchase Type page
- Add Purchase Type page
- Add Purchase page
- Edit Purchase page
- settings module
- purchase type component
- purchase component

### Backend API

- purchase type api
- purchase type tags api

## Type of Test:

- End to End
- Demo site testable

## Tags:

- feature=`settings,purchase,expense`
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

- /api/settings/purchase-types/add=1.44 sec

### Lambda:

#### add purchase type

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
