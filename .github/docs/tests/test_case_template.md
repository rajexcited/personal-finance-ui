---
id: test-case-unique-id
title: brief title
created: MM/DD/YYYY
updated: MM/DD/YYYY
execution: automation/manual
---

# Test Scenario

## Title:

Provide a brief title for the test scenario. This could be elaborated from metadata title.

## Description:

Describe the test scenario, including context and purpose.

## Preconditions:

List any prerequisites or setup steps (e.g., environment, configurations).

## Steps to Execute:

1. Step 1
2. Step 2
3. Step 3

## Expected Outcome:

- Clearly state the expected results of the test scenario.

## Impact Area:

### frontend

- Specify which part of the application this impacts (e.g., component/module, page). reference from file, [list of modules](data/features.md#list-of-components--modules)
- if 1 or more pages are impacted, reference from file, [list of all pages](data/pages.md)
- example, user login scenario impacts login page, secured home page
- example, user login scenario impacts navigation, auth components
- example, add purchase scenario impacts expenses page, add purchase page
- example, add purchase scenario impacts navigation, auth, add purchase, upload receipt, view receipts components
- example, add purchase scenario impacts expense module

### backend api

- Specify which apis are called (e.g., api brief name). reference from file, [list of apis](data/apis.md)
- example, if api [`POST /api/user/login`] is called, name can be `user login api`
- example, if api [`GET /api/user/details`] is called, name can be `user details api`
- example, if api [`GET /api/expenses`] is called, name can be `expense api`
- example, if api [`POST /api/expenses/purchase/id`] is called, name can be `expense purchase api`

## Type of Test:

- reference from file, [list of type of test](data/type-of-tests.md)
- example, Integration
- example, Regression
- example, Performance
- example, Demo site testable

## Tags:

- provide value of below tags. choose only 1 if enum list is given.
- features=comma seperated values from file [list of features](data/features.md#list-of-all-high-level-features)
- execution=`manual/automation`
- impact=`high/medium/low`
- type=`positive/negative`
- devices=comma seperated values from file [list of devices](data/devices.md)

## Affected Versions:

version this test case is introduced.

## Attachments:

Attach any screenshots, logs, or additional information if applicable.

## Average Performance Time:

### Test:

ex.
total=1 min

### Browser:

#### network calls:

for examples,

- index.html=450 ms
- api/user/login/post=1.8 sec
- api/user/details/get=2.3 sec
- api/stats/purchase/get=1.44 sec
- api/stats/refund/get=1.24 sec
- api/stats/income/get=768 ms

### Lambda:

lambda name and metrics

#### user-login

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
