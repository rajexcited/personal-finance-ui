---
id: view-receipts-expenses-tc2
---

# View receipts on expense list

## Title:

View Receipts Carousel from expense list

## Description:

User can view all receipts for expense if available on expense list page

## Preconditions:

user is logged in and is on expense list page.

## Steps to Execute:

1. user sees some expenses with `view receipt` action
2. user clicks on `view receipts` action link
3. the receipts get downloaded and shown in full screen. the carousel layout is shown with receipt operations, ex. zoom in/out image, pdf view/download, next/previous receipt
4. user can close the carousel from close button.

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while receipts are downloading.
- verify the receipts can be saved or downloaded.

## Impact Area:

### frontend

- expense page

### backend api

- expense list api
- purchase type api
- refund reason api
- payment account api
- income type api

## Type of Test:

- Integration
- Regression
- Demo site testable

## Tags:

- feature=`expense,view-list, receipt`
- execution=`manual`
- impact=`medium`
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
