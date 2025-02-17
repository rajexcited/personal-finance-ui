---
id: update-income-type-tc3
title: Update Income Type
execution: manual
created: 12/21/2024
updated: 02/15/2025
---

# Update Income Type

## Title:

Update Income Type

## Description:

A logged-in and active user can update an existing income type.

## Preconditions:

User is logged in and active. User is on the `view income type` page. A income type exists. A income exists of income type `Office Supplies`

## Steps to Execute:

1. User clicks on the `Edit` action from ellipsis next to an existing income type.
2. Verify the `Edit Income Type` form is displayed with the current details of the income type:
   - **Name:** Wage
   - **Status:** toggle switch pre-selected to `enable`
   - **Color:** color picker with pre-filled `green`
   - **Description:** `Monthly wage` and counter is 12/400
   - **Tags:** `income, wage` and counter is 2/10
3. Verify 2 buttons, `save` and `cancel`, are displayed.
4. User updates the form fields:
   - **Name:** Wage Updated
   - **Color:** blue
   - **Description:** `Updated description for Monthly wage` and counter is 28/400
   - **Tags:** `income, wage, updated` and counter is 3/10
5. User clicks on the `Save` button.
6. Verify the updated income type is displayed in the list with the correct details.
7. User navigated `add income` page
8. Verify `Wage Updated` exists in `income type` dropdown
9. On `view expense page`, verify existing income is showing updated income type name `Wage Updated`
10. User clicks `Edit` action on existing income. On `update income page`, verify selected income type label is updated.

## Expected Outcome:

- The `Edit Income Type` form is displayed.
- The updated income type is displayed in the list with the correct details.
- The updated income type is displayed in view expense, add income and edit income pages.

## Impact Area:

### Frontend

- View Income Type page
- Edit Income Type page
- Add Income page
- Edit Income page
- View Expenses page
- settings module
- income type component

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

- /api/settings/income-types/update=1.44 sec

### Lambda:

#### update income type

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
