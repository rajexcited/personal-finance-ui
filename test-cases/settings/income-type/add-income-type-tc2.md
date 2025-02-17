---
id: add-income-type-tc2
title: Add income Type
execution: manual
created: 12/21/2024
updated: 02/15/2025
---

# Add Income Type

## Title:

Add Income Type

## Description:

A logged-in and active user can add a new income type

## Preconditions:

User is logged in and active. User is on the `view income type` page.

## Steps to Execute:

1. User clicks on the `Add` button.
2. Verify the `Add Income Type` form is displayed with necessary input fields:
   - **Name:** empty
   - **Status:** toggle switch (enabled by default)
   - **Color:** color picker with default color
   - **Description:** empty and counter is 0/400
   - **Tags:** empty and counter is 0/10
3. Verify 2 buttons, `save` and `cancel`, are displayed.
4. User fills in the form fields:
   - **Name:** Wage
   - **Color:** green
   - **Description:** `Monthly wage` and counter is 12/400
   - **Tags:** `income, wage` and counter is 2/10
5. User clicks on the `Save` button.
6. Verify the new income type is added to the list with the correct details.
7. User navigated `add income` page
8. Verify `Wage` exists in `income type` dropdown

## Expected Outcome:

- The `Add Income Type` form is displayed.
- The new income type is added to the list with the correct details and can be seen in enabled list.

## Impact Area:

### Frontend

- View Income Type page
- Add Income Type page
- Add Income page
- Edit Income page
- settings module
- income type component
- income component

### Backend API

- income type api
- income type tags api

## Type of Test:

- End to End
- Demo site testable

## Tags:

- feature=`settings,income,expense`
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

- /api/settings/income-types/add=1.44 sec

### Lambda:

#### add income type

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
