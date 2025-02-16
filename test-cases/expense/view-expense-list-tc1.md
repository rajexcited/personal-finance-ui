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

Logged in user can view list of expenses and gets actions for each expense if applicable.

## Preconditions:

User is logged in and is on homepage. There is at least one expense listed.

## Steps to Execute:

1. User clicks on expense navigation link.
2. After a few seconds of waiting, the list of expenses of recent 3 months is displayed.
3. Verify 3 add buttons `add purchase`, `add income` and `add refund` are displayed before the expense list layout.
4. Verify fields and actions as per expected.
5. User clicks on `load more` button.
6. After waiting, more expenses (3 more months) are loaded, showing recent 6 months of expenses.
7. User clicks on `load more` button.
8. After waiting, `load more` button gets disabled, since there are no more expenses available.

## Expected Outcome:

1. The loading indicator is displayed for a few seconds (~3) while expenses are loaded.
2. When the user is on a desktop fullscreen, verify:
   - The table with fields is displayed.
   - Column `type`: the type of expense. The value must be from `purchase`, `income`, `refund`.
   - Column `expense date`: there will always be a date string representing month, day, and year.
   - Column `payment account`: this is optional. The allowable value can be the short name of the payment account or a DASH symbol.
   - Column `bill name`: there must be some value.
   - Column `amount`: dollar amount.
   - Column `category`: this is optional. The allowable value can be `purchase type` for purchase, `income type` for income, `reason` for refund, or a DASH symbol.
   - Column `tags`: this is optional. If the length of tags is large, then only a portion of tags will be displayed with ellipses. The tooltip always shows all tags.
   - Column `actions`: the common actions are `edit`, `delete`, `view receipts` if there are any file attachments, and `add refund` if the type is purchase.
3. When the user is on a mobile screen or small screen of the desktop, verify:
   - The cards are displayed.
   - The card has a title combined of `type` and `bill name`.
   - Below the title, the `expense date` representing the date string of day, month, and year is displayed. Next to `expense date`, the `verify indicator` symbol is displayed.
   - Also, there are `actions` displayed. The common actions are `edit`, `delete`, `view receipts` if there are any file attachments, and `add refund` if the type is purchase.
   - On the right side of the card, the expand/collapse button is displayed.
   - When clicking on expand, the expense details are shown in the card detail layout.
   - `type` or `belongsTo`: the value must be from `purchase`, `income`, `refund`.
   - `bill name`: there must be some value.
   - `payment account`: this is optional. The allowable value can be the short name of the payment account or a DASH symbol.
   - Same as the card title, the `verify indicator` symbol is displayed. If verified, the date string with a similar format of `expense date` is displayed next to the indicator.
   - `tags`: all values are displayed. DASH symbol if no tags are attached.
   - `description`: is displayed. If lengthy, it gets cut off with ellipses.

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
