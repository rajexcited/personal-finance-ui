---
id: secured-tc2
title: Secure home page
execution: manual
created: 12/21/2024
updated: 02/14/2025
---

# Secure Home Page

## Title:

Secure home page

## Description:

Verify that the secure home page loads correctly with all necessary components such as user stats for income, purchases, and refunds.

## Preconditions:

User is logged in and is on the secure home page.

## Steps to Execute:

1. Verify the header navigation links are displayed:
   - Home
   - Expenses
   - Payment Accounts
   - Settings
   - Logout
2. Verify the user stats are displayed correctly:
   - Income stats
   - Purchase stats
   - Refund stats

## Expected Outcome:

- The secure home page loads successfully.
- All header navigation links are visible and clickable.
- The user stats for income, purchases, and refunds are displayed as expected.

## Impact Area:

### frontend

- Home Secured page
- navigation component
- stats component

### backend api

- income stats api
- purchase stats api
- refund stats api

## Type of Test:

- End to End
- Demo site testable

## Tags:

- feature=`home,stats`
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

- index.html=450 ms
- api/user/details/get=2.3 sec
- api/stats/purchase/get=1.44 sec
- api/stats/refund/get=1.24 sec
- api/stats/income/get=768 ms

### Lambda:

#### stats

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
