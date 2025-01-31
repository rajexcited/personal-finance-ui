---
id: add-edit-purchase-tc4
---

# Purchase Form UI validation

## Title:

purchase form UI validation

## Description:

UI validation on purchase form

## Preconditions:

user is logged in and active. user is on add Purchase page

## Steps to Execute:

1. verify all fields are empty.
2. user clicks on `add` button
3. UI validation fails and unable to proceed with add purchase
   - bill name: error `please fill out this field`
   - purchase type: error `please select an item from dropdown`
   - payment account: error `please select an item from dropdown`
4. user enters bill name value to `s` but gets error message `Please lengthen this text to 2 characters or more (you are currently using 1 character).`
5. user tries to add below 11 tags: gets error counter 10.
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
6. space in tag value is converted to dash format.
7. there are no tag person list. user tries to add on the fly. user can't select or add. but shows what user typed in field.
8. user tries to fill bill name with `store "special"` and gets error message
9. user tries to upload unsupported file. for example `fake.txt` file. system gives error message `fake.txt is not supported. Hence, the system cannot accept.`
10. user expands `break into purchase items` and tries to add items
    - first attempt: only chooses purchase type and click add button. system gives error for `item name` is `please fill out this field`
    - user enters value `i` and gets error message `Please lengthen this text to 2 characters or more (you are currently using 1 character).`
    - user enters value `item1` and get error message for amount field `please fill out this field`
11. user clicks on `cancel` button.

## Expected Outcome:

verify all UI validation errors on fields

## Impact Area:

### frontend

- add purchase form
- update purchase form

### backend api

- purchase type api
- payment account api
- share person api
- purchase tags api

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`expense,purchase,add,edit`
- execution=`manual`
- impact=`medium`
- type=`negative`

## Affected Versions:

v0.1.0

## Attachments:

Screenshots

## Average Performance Time:

### Test:

total=1 min

### Browser:

#### network calls:

- index.html=450 ms
- api/user/login/post=1.8 sec
- api/user/details/get=2.3 sec
- api/stats/purchase/get=1.44 sec
- api/stats/refund/get=1.24 sec
- api/stats/income/get=768 ms

### Lambda:

#### user-login

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
