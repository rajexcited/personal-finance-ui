---
id: add-edit-purchase-tc4
title: Purchase form UI validations
execution: manual
created: 12/21/2024
updated: 02/12/2025
---

# Purchase Form UI validation

## Title:

Purchase form UI validations

## Description:

Perform UI field validations on purchase form

## Preconditions:

The user is logged in and active. the user navigates to `add Purchase page`

## Steps to Execute:

1. Verify all fields are empty.
2. User clicks on `add` button
3. UI validation fails and unable to proceed with add purchase
   - bill name: error `please fill out this field`
   - purchase type: error `please select an item from dropdown`
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
8. User tries to fill bill name with `store "special"` and gets error message
9. User tries to upload unsupported file. for example `fake.txt` file. system gives error message `fake.txt is not supported. Hence, the system cannot accept.`
10. User expands `break into purchase items` and tries to add items
    - first attempt: only chooses purchase type and click add button. system gives error for `item name` is `please fill out this field`
    - user enters value `i` and gets error message `Please lengthen this text to 2 characters or more (you are currently using 1 character).`
    - user enters value `item1` and get error message for amount field `please fill out this field`
11. User clicks on `cancel` button.

## Expected Outcome:

- Verify all UI validation errors on fields
- When user clicks on cancel button, user is navigated to `view expenses` page.

## Impact Area:

### frontend

- Add Purchase page
- Edit Purchase page
- navigation component
- expenses module
- purchase component

### backend api

- purchase type api
- payment account api
- share person api
- purchase tags api
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
