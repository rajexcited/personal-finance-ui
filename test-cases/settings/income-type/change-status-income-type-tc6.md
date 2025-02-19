---
id: change-status-income-type-tc6
title: Change to Disabled Status of Income Type
execution: manual
created: 12/21/2024
updated: 02/19/2025
---

# Change to Disabled Status of Income Type

## Title:

Change to Disabled Status of Income Type

## Description:

A logged-in and active user can change the status of an existing income type.

## Preconditions:

User is logged in and active. User is on the `view income type` page. An income type `Wage` exists with `enabled` status. A income exists of income type `Wage`.

## Steps to Execute:

1. User clicks on the `Change to disable` action from ellipsis next to an existing income type `Wage`.
2. Verify list of income type is updated.
3. when toggler `Filtered By enabled` ON, verify the income type `Wage` is not in the list.
4. when toggler `All types` ON, verify the income type `Wage` is in the list. Verify the status is changed to disabled.
5. User navigates to the `add income` page.
6. Verify the income type `Wage` does not exist in the `income type` dropdown.
7. On the `view expense page`, verify any existing incomes of the disabled income type show the same label `Wage` as the income type.
8. User clicks `Edit` action on existing income of income type `Wage`. On `update income page`, verify selected income type label is same `Wage` in income type dropdown.

## Expected Outcome:

- The status of the income type is changed.
- The updated status of the income type appears in the `income type` dropdown.
- Existing incomes of the income type show no change.

## Impact Area:

### Frontend

- View Income Type page
- Add Income page
- Edit Income page
- View Expenses page
- settings module
- income type component

### Backend API

- income type api

## Type of Test:

- End to End
- Demo site testable

## Tags:

- feature=`settings,income,expense`
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

- /api/settings/income-types/change-status=1.44 sec

### Lambda:

#### change status income type

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
