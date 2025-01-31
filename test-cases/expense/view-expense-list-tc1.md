---
id: view-expense-list-tc1
---

# View expense list

## Title:

View expense list

## Description:

logged in user can view list of expenses and gets actions for each expense if applicable

## Preconditions:

user is logged in and is on homepage.

## Steps to Execute:

1. user clicks on expense navigation link
2. after few seconds of waiting, list of expenses of recent 3 months displayed.
3. 3 add buttons `add purchase`, `add income` and `add refund` are displayed before expense list layout.
4. verify fields and actions as per expected.
5. user clicks on `load more` button.
6. after waiting, more expenses (3 more months) are loaded. recent 6 months of expenses.
7. user clicks on `load more` button.
8. after waiting, `load more` button gets disabled, since there are no more expenses available.

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

- feature=`expense,view-list`
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
