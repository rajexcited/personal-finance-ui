---
id: add-edit-income-tc4
title: Income form UI validations
execution: manual
created: 12/21/2024
updated: 02/11/2025
---

# Income Form - UI validation

## Title:

Income form UI validations

## Description:

Perform UI field validations on income form

## Preconditions:

The user is logged in and active. the user navigates to `add Income page`

## Steps to Execute:

1. Verify all fields are empty.
2. User clicks on `add` button
3. UI validation fails and unable to proceed with add income
   - income name: error `please fill out this field`
   - income amount: error `please fill out this field`
   - income type: error `please select an item from dropdown`
   - payment account: error `please select an item from dropdown`
4. User enters `income name` value to `a` but gets error message `Please lengthen this text to 2 characters or more (you are currently using 1 character).`
5. User tries to add below 11 tags and gets error counter 10.
   - referrel
   - celebrate
   - transfer
   - salary
   - gift card
   - blessings
   - winning
   - reward
   - god gift
   - miscellaneous
6. The space in tag value is converted to dash format.
7. There is no tag person list. User tries to add on the fly. But user can't select or add, and input field shows what user typed.
8. User tries to fill income name with `referrel "special"` and gets error message
9. User tries to upload unsupported file. for example `fake.txt` file. system gives error message `fake.txt is not supported. Hence, the system cannot accept.`
10. User clicks on `cancel` button.

## Expected Outcome:

- Verify all UI validation errors on fields
- When user clicks on cancel button, user is navigated to `view expenses` page.

## Impact Area:

### frontend

- Add Income page
- Edit Income page
- navigation component
- expenses module
- income component

### backend api

- income type api
- payment account api
- share person api
- income tags api
- currency profile api

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`expenses`
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
