---
id: update-share-person-tc3
title: Update Share Person
execution: manual
created: 12/21/2024
updated: 02/18/2025
---

# Update Share Person

## Title:

Update Share Person

## Description:

A logged-in and active user can update an existing share person.

## Preconditions:

User is logged in and active. User is on the `view share person` page. A share person exists. A income,purchase and refund exists of share person `share1`

## Steps to Execute:

1. User clicks on the `Edit` action from ellipsis next to an existing share person.
2. Verify the `Edit Share Person` form is displayed with the current details of the share person:
   - **Email Id:** shareuser1@example.com
   - **Status:** toggle switch pre-selected to `enable`
   - **First Name:** Share
   - **Last Name:** User 1
   - **Nick Name:** share1
   - **Phone number:** 123-456-7890
   - **Description:** `share person description` and counter is 24/400
   - **Tags:** `family, group1` and count is 2/10
3. Verify 2 buttons, `save` and `cancel`, are displayed.
4. User updates the form fields:
   - **Email Id:** updated.shareuser1@example.com
   - **First Name:** Share
   - **Last Name:** User 1
   - **Nick Name:** updated share1
   - **Phone number:** 123-456-7890
   - **Description:** `Updated share person description` and counter is 32/400
   - **Tags:** `family, group1` and count is 2/10
5. User clicks on the `Save` button.
6. Verify the updated share person is displayed in the list with the correct details.
7. User clicks on `View` button for `updated share1`. verify details shown.
8. User navigated `add income` page
9. Verify `updated share1` exists in `share person` dropdown
10. On `view expense page`, verify existing income is showing updated share person name `updated share1`
11. User clicks `Edit` action on existing income. On `update income page`, verify selected share person label is updated.
12. repeat steps 7 to 10 for purchase
13. repeat steps 7 to 10 for refund

## Expected Outcome:

- The `Edit Share Person` form is displayed.
- The updated share person is displayed in the list with the correct details.
- The updated share person is displayed in view expense, add and edit income, purchase, refund pages.

## Impact Area:

### Frontend

- View Share Person page
- Edit Share Person page
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
- share person tags api

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

- /api/settings/share-persons/update=1.44 sec

### Lambda:

#### update share person

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
