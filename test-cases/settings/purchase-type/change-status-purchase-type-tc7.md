---
id: change-status-purchase-type-tc7
title: Change to Enabled Status of Purchase Type
execution: manual
created: 12/21/2024
updated: 02/19/2025
---

# Change to Enabled Status of Purchase Type

## Title:

Change to Enabled Status of Purchase Type

## Description:

A logged-in and active user can change the status of an existing purchase type.

## Preconditions:

User is logged in and active. User is on the `view purchase type` page. An purchase type `Office Supplies` exists with `disabled` status. and toggler `All types` is ON.

## Steps to Execute:

1. User clicks on the `Change to enable` action from ellipsis next to an existing purchase type `Office Supplies`.
2. Verify list of purchase type is updated.
3. Verify the status of purchase type `Office Supplies` is changed in the list.
4. When toggler `Filtered By enabled` is ON, verify the purchase type `Office Supplies` is still in the list.
5. Verify the purchase type `Office Supplies` exists in the `purchase type` dropdown for `add or update` purchase page.

## Expected Outcome:

- The status of the purchase type is changed.
- Existing purchases of the purchase type show no change.

## Impact Area:

### Frontend

- View Purchase Type page
- Add Purchase page
- Edit Purchase page
- View Expenses page
- settings module
- purchase type component

### Backend API

- purchase type api

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

- /api/settings/purchase-types/change-status=1.44 sec

### Lambda:

#### change status purchase type

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
