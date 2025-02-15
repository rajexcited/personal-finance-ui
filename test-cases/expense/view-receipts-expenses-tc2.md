---
id: view-receipts-expenses-tc2
title: View Expense Receipts
execution: manual
created: 12/21/2024
updated: 02/13/2025
---

# View receipts on expense list

## Title:

View Receipts Carousel from expense list

## Description:

Logged in user can view all receipts for expense if receipt available

## Preconditions:

User is logged in and is `view expenses` page. There are at least 1 of purchase, income and refund listed with receipts.

## Steps to Execute:

1. Verify `view receipt` action on expenses which has receipts
2. User clicks on `view receipts` action link for purchase
3. Verify receipt carousel is opened in fullscreen.
4. The receipts get downloaded and shown in carousel. The carousel layout is shown with receipt operations
   - if receipt is jpeg or png image, verify zoom in and zoom out actions are displayed
   - if receipt is pdf, verify view and download actions are displayed
   - next and/or previous actions are displayed
5. Verify close close button is displayed
6. User clicks close button. Verify carousel closes/hides
7. repeat steps 2-6 for income
8. repeat steps 2-6 for refund

## Expected Outcome:

- The loading indicator is displayed for few seconds (~3) while receipts are downloading.
- Verify the receipts can be saved or downloaded.

## Impact Area:

### frontend

- View Expenses page
- expenses module
- view receipts

### backend api

- income receipt api
- purchase receipt api
- refund receipt api

## Type of Test:

- Integration
- Regression
- Demo site testable

## Tags:

- feature=`expense,purchase,income,refund`
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

#### network calls:

- api/stats/income/get=768 ms

### Lambda:

#### get expense receipt

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
