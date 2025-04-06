---
name: Regression Test Plan
title: [Testplan]: Regression Test Plan for $milestone.title
---

# Regression Test Plan

## Milestone

- **Milestone:** [$milestone.title]($milestone.issueUrl)
- **Branch:** [$milestone.branchName]($milestone.branchUrl)

#### Status as of $today

- **Open Issues:** $milestone.openIssues, [view Open issues for milestone]($milestone.issueBaseUrl?q=is%3Aissue%20state%3Aopen%20milestone%3A$milestone.title)
- **Closed Issues:** $milestone.closedIssues [view Closed issues for milestone]($milestone.issueBaseUrl?q=is%3Aissue%20state%3Aclosed%20milestone%3A$milestone.title)

#### Release Date: $milestone.dueOn

## Impact Areas:

- $details.impact_area

## Features:

- $details.tags.feature

## Test Scenarios for Regression:

| Index | Title          | Priority             | Execution           | Status  | Test Case ID                                                                                                           |
| ----- | -------------- | -------------------- | ------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| $ind  | $details.title | $details.tags.impact | $metadata.execution | Pending | [$metadata.id](https://github.com/rajexcited/personal-finance-ui/blob/testing/test-cases/$metadata.relative_file_path) |

## Start/Stop Regression Environment

1. To **start regression**, deploy or provision the milestone code to the `testplan environment`.
2. To **stop regression**, destroy or deprovision the `testplan environment`.

- Use the `Request Regression - Provision/Deprovision Test Plan Environment` template to open a subtask issue. Complete the required details for provisioning. The environment will be deployed automatically upon submission.

- After completing regression or if an extended pause is needed, open a subtask issue using the same template. Fill in the required details for deprovisioning. The environment will be destroyed automatically upon submission.

- If provisioning or deprovisioning fails, submit a new subtask issue using the same template, ensuring the corrected details are included to address errors from the previous attempt

## Pass/Fail Criteria

- All test cases must achieve a 100% pass rate, with exceptions allowed only for non-critical failures that can be deferred to a future release.
- Record the execution status (**PASS** or **FAIL**) for each test case as a comment in the issue. Use the `testcase-result` template from **saved replies** and complete the required test case details.
- For any failed test cases, log a bug issue using the `Bug Report` template.
- Ensure that all critical issues are resolved within the regression testing period.
- Associate any issues created during regression testing with this test plan as a **Parent Issue**. This enhances traceability and serves as a reference for future test cycles.

## Risk/Cost Mitigation

- If regression testing cannot continue due to unforeseen circumstances, submit a sub-issue using `Request Regression - Provision/Deprovision Test Plan Environment` template with deprovisioning details. This saves costs and allows for a fresh restart when needed.
- Active regression testing extended beyond a week is generally considered cost-inefficient. Strive to complete the testplan within a shorter timeframe.
- Monitor the testplan environment for anomalies or performance issues and address them promptly to ensure seamless testing.
- Document any challanges or fixes encountered during regression testing for future reference and process improvement.

## Notes/Comments

Provide any additional context, considerations, or instructions here.
