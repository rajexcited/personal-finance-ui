---
name: Regression Test Plan
title: "[Testplan]: Regression Test Plan for $milestone.title"
---

# Regression Test Plan

## Regression Scope:

### Milestone:

[milestone $milestone.title](https://github.com/rajexcited/personal-finance-ui/milestone/$milestone.id)  
Branch: $milestone.branch

### Impact Areas:

- $details.impact_area

### Features:

- $details.tags.feature

## Test Scenarios for Regression:

| Index | Title          | Priority             | Execution           | Status  | Test case Id                                                                                                           |
| ----- | -------------- | -------------------- | ------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| $ind  | $details.title | $details.tags.impact | $metadata.execution | Pending | [$metadata.id](https://github.com/rajexcited/personal-finance-ui/blob/testing/test-cases/$metadata.relative_file_path) |

## Start/Stop Regression Environment

To **start regression** is to `deploy` milestone code to `tpe environment`.  
To **stop regression** is to `destroy tpe environment`.

Open a subtask issue using the template `Request Form for test environment` and fill out details. The request form gets processed immediately and deploys the code.

When regression is completed or needs a longer break, close the request form issue to destroy the environment. If re-opened or created new, we can resume the test.

<small>**FYI:** `tpe environment` is the test plan execution environment. Typically it is used for any test plan executions.</small>

## Pass/Fail Criteria

- All tests must pass. 100% success rate.
- Whenever a test case is executed, document the execution status (PASS or FAIL) as a new comment. Make sure to copy the table row with updated status with other details.
- If a test case fails, create a subtask issue using the template `bug report` to document the failure and track its resolution. Once PASSED, update the comment.

## Risk/Cost Mitigation:

- If regression cannot be progressed due to some circumstances and needs a longer break, the tester can close the `tpe environment Request Form` to destroy the test environment. This can help save costs or restart from fresh.
- Typically, active regression longer than a week is considered to be cost-ineffective. The regression test plan execution should not take a long time.
- Run tests in parallel to reduce the overall execution time and minimize the risk of prolonged testing periods.
- Continuously monitor the test environment for any anomalies or performance issues. Address them promptly to avoid disruptions in the regression testing process.
- Any issues or blockers should be communicated immediately to ensure quick resolution.
- Document any issues encountered during regression testing and the steps taken to resolve them. This can help in future test cycles and improve the overall process.

## Notes/Comments:

Provide any additional context or considerations.
