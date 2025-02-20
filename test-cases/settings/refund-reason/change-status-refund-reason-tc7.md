---
id: change-status-refund-reason-tc7
title: Change to Enabled Status of Refund Reason
execution: manual
created: 12/21/2024
updated: 02/19/2025
---

# Change to Enabled Status of Refund Reason

## Title:

Change to Enabled Status of Refund Reason

## Description:

A logged-in and active user can change the status of an existing refund reason.

## Preconditions:

User is logged in and active. User is on the `view refund reason` page. An refund reason `Product Return` exists with `disabled` status. and toggler `All types` is ON.

## Steps to Execute:

1. User clicks on the `Change to enable` action from ellipsis next to an existing refund reason `Product Return`.
2. Verify list of refund reason is updated.
3. Verify the status of refund reason `Product Return` is changed in the list.
4. When toggler `Filtered By enabled` is ON, verify the refund reason `Product Return` is still in the list.
5. Verify the refund reason `Product Return` exists in the `refund reason` dropdown for `add or update` refund page.

## Expected Outcome:

- The status of the refund reason is changed.
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
