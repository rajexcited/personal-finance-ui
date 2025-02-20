---
id: change-status-income-type-tc7
title: Change to Enabled Status of Income Type
execution: manual
created: 12/21/2024
updated: 02/19/2025
---

# Change to Enabled Status of Income Type

## Title:

Change to Enabled Status of Income Type

## Description:

A logged-in and active user can change the status of an existing income type.

## Preconditions:

User is logged in and active. User is on the `view income type` page. An income type `Wage` exists with `disabled` status. and toggler `All types` is ON.

## Steps to Execute:

1. User clicks on the `Change to enable` action from ellipsis next to an existing income type `Wage`.
2. Verify list of income type is updated.
3. Verify the status of income type `Wage` is changed in the list.
4. When toggler `Filtered By enabled` is ON, verify the income type `Wage` is still in the list.
5. Verify the income type `Wage` exists in the `income type` dropdown for `add or update` income page.

## Expected Outcome:

- The status of the income type is changed.
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
