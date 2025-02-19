---
id: change-status-refund-reason-tc6
title: Change to Disabled Status of Refund Reason
execution: manual
created: 12/21/2024
updated: 02/19/2025
---

# Change to Disabled Status of Refund Reason

## Title:

Change to Disabled Status of Refund Reason

## Description:

A logged-in and active user can change the status of an existing refund reason.

## Preconditions:

User is logged in and active. User is on the `view refund reason` page. An refund reason `Product Return` exists with `enabled` status. A refund exists of refund reason `Product Return`.

## Steps to Execute:

1. User clicks on the `Change to disable` action from ellipsis next to an existing refund reason `Product Return`.
2. Verify list of refund reason is updated.
3. when toggler `Filtered By enabled` ON, verify the refund reason `Product Return` is not in the list.
4. when toggler `All types` ON, verify the refund reason `Product Return` is in the list. Verify the status is changed to disabled.
5. User navigates to the `add refund` page.
6. Verify the refund reason `Product Return` does not exist in the `refund reason` dropdown.
7. On the `view expense page`, verify any existing refunds of the disabled refund reason show the same label `Product Return` as the refund reason.
8. User clicks `Edit` action on existing refund of refund reason `Product Return`. On `update refund page`, verify selected refund reason label is same `Product Return` in refund reason dropdown.

## Expected Outcome:

- The status of the refund reason is changed.
- The updated status of the refund reason appears in the `refund reason` dropdown.
- Existing refunds of the refund reason show no change.

## Impact Area:

### Frontend

- View Refund Reason page
- Add Refund page
- Edit Refund page
- View Expenses page
- settings module
- refund reason component

### Backend API

- refund reason api

## Type of Test:

- End to End
- Demo site testable

## Tags:

- feature=`settings,refund,expense`
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

- /api/settings/refund-reasons/change-status=1.44 sec

### Lambda:

#### change status refund reason

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
