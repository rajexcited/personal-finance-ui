---
id: add-share-person-tc2
title: Add Share Person
execution: manual
created: 12/21/2024
updated: 02/18/2025
---

# Add Share Person

## Title:

Add Share Person

## Description:

A logged-in and active user can add a new share person

## Preconditions:

User is logged in and active. User is on the `view share person` page.

## Steps to Execute:

1. User clicks on the `Add` button.
2. Verify the `Add Share Person` form is displayed with necessary input fields:
   - **Email Id:** empty
   - **Status:** toggle switch (enabled by default)
   - **First Name:** empty
   - **Last Name:** empty
   - **Nick Name:** empty
   - **Phone number:** empty
   - **Description:** empty and counter is `0/400`
   - **Tags:** empty and counter is `0/10`
3. Verify 2 buttons, `save` and `cancel`, are displayed.
4. User fills in the form fields:
   - **Email Id:** shareuser1@example.com
   - **First Name:** Share
   - **Last Name:** User 1
   - **Nick Name:** share1
   - **Phone number:** 123-456-7890
   - **Description:** `share person description` and counter is 24/400
   - **Tags:** `family, group1` and count is 2/10
5. User clicks on the `Save` button.
6. Verify the new share person is added to the list with the correct details.
7. Verify `View` button next to `share1` row is displayed
8. User clicks on `View` button for `share1`. verify details shown.
9. Verify `share1` exists in `share person` dropdown on `add purchase page`
10. Verify `share1` exists in `share person` dropdown on `edit purchase page`
11. Verify `share1` exists in `share person` dropdown on `add income page`
12. Verify `share1` exists in `share person` dropdown on `edit income page`
13. Verify `share1` exists in `share person` dropdown on `add refund page`
14. Verify `share1` exists in `share person` dropdown on `edit refund page`

## Expected Outcome:

- The `Add Share Person` form is displayed.
- The new share person is added to the list with the correct details and can be seen in enabled list.

## Impact Area:

### Frontend

- View Share Person page
- Add Share Person page
- Add Income page
- Edit Income page
- Add Purchase page
- Edit Purchase page
- Add Refund page
- Edit Refund page
- settings module
- share person component
- income component
- purchase component
- refund component

### Backend API

- share person api
- share person tags api

## Type of Test:

- End to End
- Demo site testable

## Tags:

- feature=`settings,income,purchase,refund`
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

- /api/settings/share-persons/add=1.44 sec

### Lambda:

#### add share person

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
