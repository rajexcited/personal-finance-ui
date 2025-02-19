---
id: delete-share-person-tc5
title: Delete Share Person
execution: manual
created: 12/21/2024
updated: 02/18/2025
---

# Delete Share Person

## Title:

Delete Share Person

## Description:

A logged-in and active user can delete an existing share person.

## Preconditions:

User is logged in and active. User is on the `view share person` page. A share person exists. A income,purchase, and refund exists of share person `share1`

## Steps to Execute:

1. User clicks on the `Delete` action from ellipsis next to an existing share person `share1`.
2. Verify a confirmation dialog is displayed with the message `Are you sure you want to delete this share person?`.
3. Verify 2 buttons, `confirm` and `cancel`, are displayed in the confirmation dialog.
4. User clicks on the `Cancel` button.
5. Verify the share person is not removed from the list.
6. repeat steps 1, 2 and 3.
7. User clicks on the `Confirm` button.
8. Verify the share person is removed from the list.
9. Verify a success message `Share Person deleted successfully` is displayed.
10. User navigates to the `add income` page.
11. Verify the deleted share person does not exist in the `share person` dropdown.
12. User navigates to the `add purchase` page.
13. Verify the deleted share person does not exist in the `share person` dropdown.
14. User navigates to the `add refund` page.
15. Verify the deleted share person does not exist in the `share person` dropdown.
16. On the `view expense page`, verify any existing income, purchase and refund of the deleted share person show the same label `share1` as the share person.
17. User clicks `Edit` action on existing income of the deleted share person. On `update income page`, verify selected share person label is same `share1` in share person dropdown.
18. User clicks `Edit` action on existing income of the deleted share person. On `update purchase page`, verify selected share person label is same `share1` in share person dropdown.
19. User clicks `Edit` action on existing income of the deleted share person. On `update refund page`, verify selected share person label is same `share1` in share person dropdown.

## Expected Outcome:

- The confirmation dialog is displayed.
- The share person is removed from the list.
- A success message is displayed.
- The deleted share person does not appear in the `share person` dropdown.
- Existing income, purchase, refund of the deleted share person show `share1` as the share person.

## Impact Area:

### Frontend

- View Share Person page
- Add Income page
- Edit Income page
- Add Purchase page
- Edit Purchase page
- Add Refund page
- Edit Refund page
- View Expenses page
- settings module
- share person component

### Backend API

- share person api

## Type of Test:

- End to End
- Demo site testable

## Tags:

- feature=`settings,income,purchase,refund,expense`
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

- /api/settings/share-persons/delete=1.44 sec

### Lambda:

#### delete share person

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
