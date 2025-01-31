---
id: edit-refund-tc4
---

# Edit Refund - Success

## Title:

Editing refund successfully

## Description:

active user can update existing refund details

## Preconditions:

user is logged in and active. expense view list page is launched with at least 1 refund

## Steps to Execute:

1. user clicks on `update refund` action from refund view `refund for local grocery store`
2. after few seconds of waiting, user is redirected to refund Edit form
3. verify all fields are initialized with appropriate values of refund.
4. there are 2 buttons, `update` and `cancel`, are displayed at the bottom of screen.
5. user updates details below,
   - bill name: change to `refund for snacks`
   - bill amount: change to `5`. verify `USA-USD` and `dollar symbol` is displayed to amount field.
   - payment account: dropdown is `cash` selected. unselect the item.
   - refund reason: dropdown is `costly` selected. change to `don't like`
   - tag person: if there is 1 selected, remove. if there isn't any, add 1.
   - description: clear the text.
   - tags: remove all tags
   - refund verified: click on verify indicator to change to verified.
   - refund date: leave it unchanged
   - upload receipt: verify message `1 receipt file is uploaded`. click on `upload /view receipts`.
     - a popup opens with thumbnail image view.
     - remove all uploaded receipts and verify message `there are no receipts`.
     - close the popup and verify message `no receipt uploaded` is displayed.
6. click on `update` button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while refund is being updated.
- when successfully updated, the expense list is showing updated refund with filled out values.
- `view receipts` action is not showing for the refund.
- in small screen, it can be expanded. verify details

## Impact Area:

### frontend

- expense page
- update refund form

### backend api

- expense list api
- refund type api
- payment account api
- share person api
- refund api get
- refund tags api
- refund api post.

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`expense,refund,edit`
- execution=`manual`
- impact=`high`
- type=`positive`

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
