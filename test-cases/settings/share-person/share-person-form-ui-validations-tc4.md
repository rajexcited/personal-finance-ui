---
id: share-person-form-ui-validations-tc4
title: Share Person Form UI Validations
execution: manual
created: 12/21/2024
updated: 02/18/2025
---

# Share Person Form UI Validations

## Title:

Share Person Form UI Validations

## Description:

A logged-in and active user can validate the UI elements and constraints of the share person form.

## Preconditions:

User is logged in and active. User is on the `view share person` page.

## Steps to Execute:

1. User clicks on the `Add` button.
2. Verify the `Add Share Person` form is displayed with the following fields:
   - **Email Id:** empty
   - **Status:** toggle switch (enabled by default)
   - **First Name:** empty
   - **Last Name:** empty
   - **Nick Name:** empty
   - **Phone number:** empty
   - **Description:** empty and counter is `0/400`
   - **Tags:** empty and counter is `0/10`
3. Verify 2 buttons, `save` and `cancel`, are displayed.
4. User touches each field and clicks on the `Save` button.
5. UI validation fails and unable to proceed with adding payment account:
   - **Email Id:** error `Please fill out this field`
   - **First Name:** error `Please fill out this field`
   - **Last Name:** error `Please fill out this field`
   - **Phone number:** error `phone number must follow the pattern 222-3333-4444 or +1-222-333-4444`
6. User enters a **First Name** with `f` and **Last with** with `l`
7. Verify an error message `Please lengthen this text to 2 characters or more (you are currently using 1 character).` is displayed below the input fields.
8. User clicks on the `Cancel` button.
9. Verify the share person is not added to the list.

## Expected Outcome:

- The `Add Share Person` form is displayed with all required fields.
- Appropriate error messages are displayed for invalid inputs.

## Impact Area:

### Frontend

- Add Share Person page
- Edit Share Person page
- settings module
- share person component

### Backend API

- share person tags api

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`settings`
- execution=`manual`
- impact=`medium`
- type=`negative`
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

- /api/settings/share-persons/tags/get=1.44 sec

### Lambda:

#### get share person tags

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
