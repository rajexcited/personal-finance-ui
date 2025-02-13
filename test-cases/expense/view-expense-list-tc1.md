---
id: view-expense-list-tc1
title: View Expenses
execution: manual
created: 12/21/2024
updated: 02/13/2025
---

# View expense list

## Title:

View expense list

## Description:

Logged in user can view list of expenses and gets actions for each expense if applicable

## Preconditions:

User is logged in and is on homepage. There is atleast 1 expense listed.

## Steps to Execute:

1. User clicks on expense navigation link
2. After few seconds of waiting, list of expenses of recent 3 months displayed.
3. Verify 3 add buttons `add purchase`, `add income` and `add refund` are displayed before expense list layout.
4. Verify fields and actions as per expected.
5. User clicks on `load more` button.
6. After waiting, more expenses (3 more months) are loaded. recent 6 months of expenses.
7. User clicks on `load more` button.
8. After waiting, `load more` button gets disabled, since there are no more expenses available.

## Expected Outcome:

1. The loading indicator is displayed for few seconds (~3) while expenses are loaded.
2. When user is on desktop fullscreen, verify
   - the table with fields is displayed.
   - column `type`: the what type of expense is. the value must be from `purchase`, `income`, `refund`.
   - column `expense date`: there will always be a date string representing month, day and year.
   - column `payment account`: this is optional. the allowable value can be short name of payment account or DASH symbol.
   - column `bill name`: there must be some value
   - column `amount`: dollar amount
   - column `category`: this is optional. the allowable value can be `purchase type` for purchase, `income type` for income, `reason` for refund, or DASH symbol.
   - column `tags`: this is optional. if length of tags large, then only portion of tags will be displayed with ellipses.the tooltip always shows all tags.
   - column `actions`: the common actions are `edit`, `delete`. `view receipts`, if there are any file attachments. `add refund` if the type is purchase.
3. When user is on mobile screen or small screen of desktop, verify
   - the cards are displaying
   - card has title combined of `type` and `bill name`
   - below title, `expense date` represting date string of day, month and year is displayed. next to `expense date` the `verify indicator` symbol is displayed.
   - also, there are `actions` displaying. the common actions are `edit`, `delete`. `view receipts`, if there are any file attachments. `add refund` if the type is purchase.
   - on right side of card, the expand/collapse button is displayed.
   - when click on expand, the expense details are shown in card detail layout.
   - `type` or `belongsTo`: the value must be from `purchase`, `income`, `refund`.
   - `bill name`: there must be some value
   - `payment account`: this is optional. the allowable value can be short name of payment account or DASH symbol.
   - same as card title, the `verify indicator` symbol is displayed. but if verified, the date string with similar format of `expense date` is displayed next to indicator.
   - `tags` all values are displayed. DASH symbol if no tags attached.
   - `description` is displayed. if lengthy, it gets cutoff with ellipses.

## Impact Area:

### frontend

- View Expenses page
- navigation component
- expenses module

### backend api

- expense count api
- expense api
- purchase api
- purchase type api
- income api
- income type api
- refund api
- refund reason api
- payment account api
- share person api

## Type of Test:

- End to End
- Regression
- Demo site testable

## Tags:

- feature=`expense`
- execution=`manual`
- impact=`high`
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

- /api/expenses/get=1.44 sec
- /api/expenses/count/get=1.44 sec

### Lambda:

#### get expense list

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

#### get expense count

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
