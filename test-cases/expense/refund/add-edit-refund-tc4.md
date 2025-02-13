---
id: add-edit-refund-tc4
title: Refund form UI validations
execution: manual
created: 12/21/2024
updated: 02/12/2025
---

# Refund Form UI validation

## Title:

Refund form UI validations

## Description:

Perform UI field validations on refund form

## Preconditions:

The user is logged in and active. the user navigates to `add refund page`

## Steps to Execute:

1. Verify all fields are empty.
2. User clicks on `add` button
3. UI validation fails and unable to proceed with add refund
   - bill name: error `please fill out this field`
   - refund amount: error `please fill out this field`
   - refund reason: error `please select an item from dropdown`
   - payment account: error `please select an item from dropdown`
4. User enters bill name value to `s` but gets error message `Please lengthen this text to 2 characters or more (you are currently using 1 character).`
5. User tries to add below 11 tags: gets error counter 10.
   - invite
   - celebrate
   - hangout
   - restaurant order
   - home cook
   - pot luck
   - get to gethor
   - alcohol
   - use and throw
   - cold drinks
   - water
6. The space in tag value is converted to dash format.
7. There are no tag person list. user tries to add on the fly. user can't select or add. but shows what user typed in field.
8. User tries to fill bill name with `refund for store "special"` and gets error message
9. User tries to upload unsupported file. for example `fake.txt` file. system gives error message `fake.txt is not supported. Hence, the system cannot accept.`
10. User clicks on `cancel` button.

## Expected Outcome:

- Verify all UI validation errors on fields
- When user clicks on cancel button, user is navigated to `view expenses` page.

## Impact Area:

### frontend

- Add Refund page
- Edit Refund page
- navigation component
- expenses module
- refund component

### backend api

- refund reason api
- payment account api
- share person api
- refund tags api
- currency profile api

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`expense`
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

#### network calls:

### Lambda:

## Notes/Comments:

Any additional information or considerations.
